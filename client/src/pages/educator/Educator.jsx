import { Outlet } from "react-router-dom"

const Educator = () => {
  return (
    <div>
      <h1>Eductaor page</h1>
      <div>{<Outlet/>}</div>
    </div>
  )
}

export default Educator
