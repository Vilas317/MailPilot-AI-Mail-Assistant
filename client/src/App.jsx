// import { useEffect, useState } from "react";
// import api from "./api/axios";

// function App() {
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     api.get("/")
//       .then((res) => {
//         setMessage(res.data.message);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }, []);

//   return (
//     <div style={{ padding: "40px" }}>
//       <h1>Processity Mail AI</h1>

//       <h2>{message}</h2>
//     </div>
//   );
// }

// export default App;
// import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EmailProvider } from "./context/EmailContext";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Inbox from "./pages/Inbox/Inbox";
import Sent from "./pages/Sent/Sent";
import Compose from "./pages/Compose/Compose";
import EmailDetail from "./pages/EmailDetail/EmailDetail";

function App() {
  return (
    <EmailProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Inbox />} />
          <Route path="sent" element={<Sent />} />
          <Route path="compose" element={<Compose />} />
          <Route
            path="email/:id"
            element={<EmailDetail />}
          />
        </Route>
      </Routes>
    </EmailProvider>
  );
}

export default App;