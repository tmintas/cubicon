import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const arr = "test";
     
    fetch("http://localhost:3000/users")
        .then((v) => v.json())
        .then((res) => {
            console.log('users:')
            console.log(res);
        })

    return (
        <div className="App">
            {arr}
        </div>
  );
}

export default App;
