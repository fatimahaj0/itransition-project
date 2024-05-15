import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';
import "./style.css"

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState();
  const navigate = useNavigate();
  
 const handleSubmit = (e) => {
  e.preventDefault();
  axios
    .post("http://localhost:8081/signin", { email, password })
    .then((result) => {
	  if (result.data.success) {
		  localStorage.setItem('token', result.data.token);
			const navigateTo = result.data.isAdmin ? "/admin-panel" : "/";
			navigate(navigateTo);
      } else {
        setErrorMessage(response.data.error || "Sign-in was unsuccessful.");
      }
    })
   .catch((error) => {
      if (error.response) {
        setErrorMessage(error.response.data.error || "An unknown error occurred.");
      } else if (error.request) {
        setErrorMessage("No response from server. Please try again later.");
      } else {
		  console.log(error);
        setErrorMessage("An error occurred. Please try again later.");
      }
    });
};

  return (
	<div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                name="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                placeholder="Enter Password"
                name="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-dark w-100">
            Login
          </button>
		   <span className = "text-danger">{errorMessage && <p>{errorMessage}</p>}</span>
        </form>
        <p className="mt-3 mb-0 text-center">Don't have an Account?</p>
        <Link
          to="/signup"
          className="btn btn-link btn-sm d-block mx-auto text-center"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
export default SignIn;
