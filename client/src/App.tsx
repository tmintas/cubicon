import "./App.scss";
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import UserList from "./components/UserList";
import EditContestForm from "./components/EditContestForm";
import ContestsList from "./components/ContestsList";
import EditResults from "./components/EditResults";
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import { useState } from "react";
import { Notification } from './models/state';

const App = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = (index: number) => {
        setNotifications((notifications: Notification[]) => {
            const updated = [...notifications].filter((_, i) => i !== index);

            return updated;
        })
    }

    return (
        <BrowserRouter>
            <nav className="nav-menu">
                <NavLink to="/contests" className={({ isActive }) =>(isActive ? " active" : "")}>КОНТЕСТЫ</NavLink>
            </nav>
            <div className="main-container">
                <div className="wrapper">
                    <Routes>
                        <Route path="/contests" element={<ContestsList />}></Route>
                        <Route path="/edit-contest/:id" element={<EditContestForm setNotifications={setNotifications}/>}></Route>
                        <Route path="/edit-results/:id" element={<EditResults setNotifications={setNotifications}/>}></Route>
                        <Route path="/users" element={<UserList />}></Route>
                        <Route path="/" element={<Navigate to="/contests" />}></Route>
                    </Routes>
                </div>
            </div>
            { notifications.length ? 
                <div className="notifications">
                {
                    notifications.map((n, i) => {
                        return (
                            <div className="notification" key={i}>
                                <ErrorIcon className="error-icon"></ErrorIcon>
                                {n.message}
                                <CancelIcon className="clear-icon" onClick={() => removeNotification(i)}></CancelIcon>
                            </div>
                        )
                    })
                } 
                </div>
                : <div></div>
            }
        </BrowserRouter>
    );
}

export default App;
