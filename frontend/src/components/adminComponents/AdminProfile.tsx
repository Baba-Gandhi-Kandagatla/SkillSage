import { useNavigate } from "react-router-dom";

export default function AdminProfile () {
    const navigate = useNavigate();
    return(
        <div className="pt-20">
        <button onClick={()=>{
            navigate("/")
        }}>
            Button to go home
        </button>
        Admin Profile
        </div>
    )
}
