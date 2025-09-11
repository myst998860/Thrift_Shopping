import { useLocation } from "react-router-dom";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup", "/partner-signup"].includes(
    location.pathname
  );

  return (
    <div className={isAuthPage ? "auth-container" : "main-container"}>
      {children}
    </div>
  );
};

export default AppLayout;
