import { useNavigate } from "react-router-dom";

export const Warning = ()=>{
    const navigate = useNavigate();
    return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "red",
            color: "white",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h1>You shouldn’t open this on mobile!</h1>
          <p>This application is meant for laptops and desktops.</p>
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      ); 
}