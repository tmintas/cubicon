import { useState } from "react";
import "./App.scss";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TextField } from "@mui/material";

type ContestFormState = {
    organizer: string,
    name: string,
    city: string,
    date: Date,
    vkLink: string,
    location: string,
    organizedById: any,
    organizedBy: any,
    rounds: any[],
}

// TODO 
// добавить город в модель
// сделать автокомплит для организатора
// разобраться с локалями дат
// раунды
// типы раундов

const App = () => {
    const [ formState, setFormState ] = useState<ContestFormState>({
        organizer: '',
        name: '',
        city: '',
        date: new Date(),
        vkLink: '',
        location: '',
        organizedById: null,
        organizedBy: null,
        rounds: []
    });

    const handleSubmit = () => {
        const test =     {
            "name": formState.name,
            "vkUrl": formState.vkLink,
            "date": formState.date,
            "organizedById": 3
        };

        fetch("http://localhost:3000/contests", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(test),
        })
            .then((v) => v.json())
            .then((res) => {
                console.log('result:')
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
    });

    return (
        <>
            <div className="nav-menu">side</div>
            <div className="main-container">
                <div className="wrapper">
                    <div className="info-container">
                        Создание нового контеста
                    </div>
                    <div inline-datepicker="true" data-date="02/25/2022"></div>
                    <div className="create-contest-form">
                        <table className="main-info-table">
                            <tbody>
                                <tr>
                                    <td>
                                        <label id="organizer-label" htmlFor="organizer-input">Организатор</label>
                                    </td>
                                    <td>
                                        <input 
                                            id="organizer-input" 
                                            type="text"
                                            value={formState.organizer} 
                                            onChange={(e) => setFormState({ ...formState, organizer: e.target.value })}
                                        />
                                    </td>
                                </tr>
                                <tr className="empty"></tr>
                                <tr>
                                    <td>
                                        <label id="name-label" htmlFor="name-input">Название</label>
                                    </td>
                                    <td>
                                        <input 
                                            id="city-input" 
                                            type="text"
                                            value={formState.name} 
                                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                        />
                                    </td>
                                </tr>
                                <tr className="empty"></tr>
                                <tr>
                                    <td>
                                        <label id="vk-label" htmlFor="vk-input">Ссылка VK</label>
                                    </td>
                                    <td>
                                        <input 
                                            id="vk-input" 
                                            type="text"
                                            value={formState.vkLink} 
                                            onChange={(e) => setFormState({ ...formState, vkLink: e.target.value })}
                                        />
                                    </td>
                                </tr>
                                <tr className="empty"></tr>
                            </tbody>
                        </table>

                        <div className="calendar-container">
                            <label className="date-label">Дата проведения</label>
                            <ThemeProvider theme={darkTheme}>
                                <LocalizationProvider 
                                    dateAdapter={AdapterMoment}
                                >
                                    <DatePicker
                                        value={formState.date}
                                        onChange={(date: any) => {
                                            setFormState({ ...formState, date: (date.toDate()       ) })
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </ThemeProvider>

                            <div className="city-container">
                                <label id="city-label" htmlFor="city-input">Город</label>
                                <input 
                                    id="city-input" 
                                    type="text"
                                    value={formState.city} 
                                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="events-container">
                            <div className="events-label">Дисциплины</div>
                            <div className="events-list">
                                <div className="event">
                                    <div className="event-name">
                                        3x3
                                    </div>
                                    <div className="event-rounds">
                                        раунды (2)
                                    </div>
                                </div>
                                <div className="event">
                                    <div className="event-name">
                                        4x4
                                    </div>
                                    <div className="event-rounds">
                                        раунды (2)
                                    </div>
                                </div>
                                <div className="event">
                                    <div className="event-name">
                                        5x5
                                    </div>
                                    <div className="event-rounds">
                                        раунды (2)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <table className="rounds-table">
                            <tbody>
                                <tr className="header-row">
                                    <td>
                                        Раунды 3х3
                                    </td>
                                    <td>
                                        <button className="add-round-btn">
                                            +
                                        </button>
                                    </td>
                                </tr>
                                <tr className="empty"></tr>

                                <tr className="round-row">
                                    <td>
                                        <button className="remove-round-btn">
                                            -
                                        </button>
                                    </td>
                                    <td>
                                        3x3 первый раунд
                                    </td>
                                    <td>
                                        <div>
                                            <input type="radio" name="group1" id="r1" value="1" />
                                            <label htmlFor="r1"> среднее из 5</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <input type="radio" name="group1" id="r1" value="1" />
                                            <label htmlFor="r1"> среднее из 3</label>
                                        </div>
                                    </td>
                                    <td className="empty"></td>
                                </tr>
                                <tr className="empty"></tr>
                                <tr className="round-row">
                                    <td>
                                        <button className="remove-round-btn">
                                            -
                                        </button>
                                    </td>
                                    <td>
                                        3х3 финал
                                    </td>
                                    <td>
                                        <div>
                                            <input type="radio" name="group1" id="r1" value="1" />
                                            <label htmlFor="r1"> среднее из 5</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <input type="radio" name="group1" id="r1" value="1" />
                                            <label htmlFor="r1"> среднее из 3</label>
                                        </div>
                                    </td>
                                    <td className="empty"></td>
                                </tr>     
                            </tbody>
                        </table>

                        <div className="actions-container">
                            <button onClick={handleSubmit}>
                                Сохранить
                            </button>
                            <div className="img-container"></div>
                            <button>
                                Назад к списку
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;