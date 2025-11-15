import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../hooks/AuthContext.jsx";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthContext();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Decode token on backend if needed, or fetch user info endpoint
      // For now, just store token in context/localStorage
      login(token, null); // You can fetch user details with this token if you want
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  }, []);

  return <p>Signing you in with Google...</p>;
}
