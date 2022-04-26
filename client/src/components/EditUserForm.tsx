import React, { useState } from "react";

type UserFormState = {
    firstName: string,
    lastName: string,
    email: string,
}

const EditUserForm = () => {
    const [ formState, setFormState ] = useState<UserFormState>({} as UserFormState);

    const onFirstNameChange = (event: React.FormEvent<HTMLInputElement>) => {
        const currentState = formState;
        const updatedFirstName = event.currentTarget.value;
        
        setFormState({ ...currentState, firstName: updatedFirstName });
    }

    const onLastNameChange = (event: React.FormEvent<HTMLInputElement>) => {
        const currentState = formState;
        const updatedLastName = event.currentTarget.value;
        
        setFormState({ ...currentState, lastName: updatedLastName });
    }

    const onEmailChange = (event: React.FormEvent<HTMLInputElement>) => {
        const currentState = formState;
        const updatedEmail = event.currentTarget.value;
        
        setFormState({ ...currentState, email: updatedEmail });
    }

    const onFormSubmit = async () => {
        let response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(formState),
        });

        let result = await response.json();
    }

    return (
        <>
            <h2>User Form</h2>
            <input type="text" onChange={onFirstNameChange}/>
            <input type="text" onChange={onLastNameChange}/>
            <input type="text" onChange={onEmailChange}/>

            <button type="submit" onClick={onFormSubmit}>Submit</button>

            app state:
            <div>
                firstName: {formState.firstName}
            </div>
            <div>
                lastName: {formState.lastName}
            </div>
            <div>
                email: {formState.email}
            </div>
        </>
    )
}

export default EditUserForm;