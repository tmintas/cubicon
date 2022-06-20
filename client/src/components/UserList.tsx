import { useEffect, useState } from "react";
import EditUserForm from "./EditUserForm";

type User = {
    email: string,
    firstName: string,
    lastName: string,
}

type UserListState = {
    error: Error,
    isLoaded: boolean,
    users: User[],
}

const UserList = () => {
    const [ state, setState ] = useState<UserListState>({} as UserListState);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_SERVER_URL}/users`)
            .then(res => res.json())
            .then((users) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        users
                    };
                });
            })
            .catch((error) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        error
                    };
                });
            })
            .finally(() => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        isLoaded: true,
                    };
                });
            })
    }, []);

    if (state.error) return <div>Error: {state.error.message}</div>
    else if (!state.isLoaded) return <div>Loading...</div>
    else return (
        <>
            <h1>Users:</h1>
            <ul>
                {state.users.map((u) => {
                    return (
                        <li key={u.email}>
                            {`${u.firstName} ${u.lastName}`}
                        </li>
                    )
                })}
            </ul>

            <EditUserForm></EditUserForm>
        </>
    )
}

export default UserList;