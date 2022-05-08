import "./App.scss";
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import UserList from "./components/UserList";
import EditContestForm from "./components/EditContestForm";
import ContestsList from "./components/ContestsList";
import EditResults from "./components/EditResults";

// TODO 
// make organizator autocomplete input
// date locales
// form validation
// add other events, 4x4, 5x5 etc

const App = () => {
    return (
        <BrowserRouter>
            <nav className="nav-menu">
                <NavLink to="/contests" className={({ isActive }) =>(isActive ? " active" : "")}>КОНТЕСТЫ</NavLink>
            </nav>
            <div className="main-container">
                <div className="wrapper">
                    <Routes>
                        <Route path="/contests" element={<ContestsList />}></Route>
                        <Route path="/edit-contest/:id" element={<EditContestForm />}></Route>
                        <Route path="/edit-results/:id" element={<EditResults />}></Route>
                        <Route path="/users" element={<UserList />}></Route>
                        <Route path="/" element={<Navigate to="/contests" />}></Route>
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
