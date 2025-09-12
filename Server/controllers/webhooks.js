import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import Purchase from "../models/purchase.js";
import Course from "../models/Course.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const payload = req.body;
    const headers = req.headers;
    
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    
    // Verify webhook signature
    await whook.verify(payload, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"]
    });
    
    // Parse the webhook payload
    const { data, type } = JSON.parse(payload.toString());
    
    console.log(`Received webhook type: ${type}`);

    switch(type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url
        };
        
        await User.create(userData);
        console.log("New user created:", userData);
        return res.json({ success: true, message: "User created" });
      }
      
      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url
        };
        
        await User.findByIdAndUpdate(data.id, userData);
        console.log("User updated:", userData);
        return res.json({ success: true, message: "User updated" });
      }
      
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("User deleted:", data.id);
        return res.json({ success: true, message: "User deleted" });
      }
      
      default:
        console.log("Unhandled webhook type:", type);
        return res.json({ success: true, message: "Webhook received but not handled" });
    }
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};


// console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
   const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }
  catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const {purchaseId} = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId.toString());

      courseData.enrolledStudents.push(userData);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      purchaseData.status = 'completed';
      await purchaseData.save();

      break;
    }
    case 'payment_intent.payment_failed': {
     const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const {purchaseId} = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = 'failed';
      await purchaseData.save();
      
      break;
    }
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  // Return a response to acknowledge receipt of the event
  res.json({received: true});
}