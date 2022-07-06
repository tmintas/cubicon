import "./App.scss";
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import UserList from "./components/UserList";
import EditContestForm from "./components/EditContestForm";
import ContestsList from "./components/ContestsList";
import EditResults from "./components/EditResults";
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import { useCallback, useState } from "react";
import { Notification } from './models/state';
import { createTheme, ThemeProvider } from "@mui/material";
import UserProfilePage from "./components/UserProfilePage";

const App = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Notification) => {
        setNotifications(notifications => {
            return [ ...notifications, notification];
        });
    }, []);

    const removeNotification = (index: number) => {
        setNotifications((notifications: Notification[]) => {
            const updated = [...notifications].filter((_, i) => i !== index);

            return updated;
        })
    }

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    return (
        <BrowserRouter>
            <ThemeProvider theme={darkTheme}>
                <nav className="nav-menu">
                    <NavLink to="/contests?showUpcoming=true" className={({ isActive }) =>(isActive ? " active" : "")}>КОНТЕСТЫ</NavLink>
                </nav>
                <div className="main-container">
                    <div className="wrapper">
                        <Routes>
                            <Route path="/contests" element={<ContestsList addNotification={addNotification}/>}></Route>
                            <Route path="/contests/:id/edit" element={<EditContestForm addNotification={addNotification}/>}></Route>
                            <Route path="/contests/:id/edit-results" element={
                                <EditResults 
                                    addNotification={addNotification}
                                    isEditingMode={true}/>}
                            ></Route>
                            <Route path="/contests/:id/results" element={
                                <EditResults 
                                    addNotification={addNotification}
                                    isEditingMode={false}/>}
                            ></Route>
                            <Route path="/users" element={<UserList />}></Route>
                            <Route path="/users/:id" element={<UserProfilePage />}></Route>
                            <Route path="/" element={<Navigate to="/contests?showUpcoming=true" />}></Route>
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
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
