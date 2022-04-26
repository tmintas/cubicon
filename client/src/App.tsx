import { useState } from "react";
import "./App.scss";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TextField } from "@mui/material";

type ContestFormState = {
    name: string,
    city: string,
    date: Date,
    vkLink: string,
    location: string,
    organizedById: any,
    organizedBy: any,
    rounds: Round[],
}

type Round = {
    name: string,
    type: RoundType,
}

enum RoundType {
    AVERAGE_OF_5 = 'AVERAGE_OF_5',
    MEAN_OF_3 = 'MEAN_OF_3',
}

// TODO 
// make organizator autocomplete input
// date locales
// form validation
// add other events, 4x4, 5x5 etc

const App = () => {
    const [ formState, setFormState ] = useState<ContestFormState>({
        name: '',
        city: 'Казань',
        date: new Date(),
        vkLink: '',
        location: '',
        organizedById: 3,
        organizedBy: null,
        rounds: []
    });
    
    const handleSubmit = () => {
        const test =     {
            "name": formState.name,
            "vkUrl": formState.vkLink,
            "date": formState.date,
            "city": formState.city,
            "rounds": formState.rounds,
            "organizedById": formState.organizedById,
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

    const availableRounds: Round[] = [
        { name: '3x3 финал', type: RoundType.AVERAGE_OF_5 },
        { name: '3x3 полуфинал', type: RoundType.AVERAGE_OF_5  },
        { name: '3x3 первый раунд', type: RoundType.AVERAGE_OF_5  },
    ];

    const addNewRound = () => {
        const addedRounds = formState.rounds;
        const newRounds = [...availableRounds].splice(0, addedRounds.length + 1);

        setFormState({
            ...formState,
            rounds: newRounds.reverse(),
        })
    }

    const removeRound = () => {
        const currentRoundsNumber = formState.rounds.length;
        let newRounds: Round[] = [];

        if (currentRoundsNumber > 1) {
            newRounds = [...availableRounds].splice(0, currentRoundsNumber - 1);
        }

        setFormState({
            ...formState,
            rounds: newRounds.reverse(),
        });
    }

    console.log(formState.rounds);
    
    const roundItems = formState.rounds?.map(r => {
        return (
            <tr key={r.name} className="round-row">
                <td> </td>
                <td>
                    {r.name}
                </td>
                <td>
                    <div>
                        <input 
                            id="r1" 
                            type="radio" 
                            name={r.name} 
                            checked={r.type === RoundType.AVERAGE_OF_5} 
                            onChange={() => setRoundType(r, RoundType.AVERAGE_OF_5)}
                        />
                        <label htmlFor="r1"> среднее из 5</label>
                    </div>
                </td>
                <td>
                    <div>
                        <input
                            type="radio" 
                            name={r.name}
                            id="r1" 
                            value="1" 
                            checked={r.type === RoundType.MEAN_OF_3} 
                            onChange={() => setRoundType(r, RoundType.MEAN_OF_3)}
                        />
                        <label htmlFor="r1"> среднее из 3</label>
                    </div>
                </td>
                <td className="empty"></td>
            </tr>
        )
    });

    const setRoundType = (round: Round, roundType: RoundType) => {
        console.log('set ');
        
        round.type = roundType;

        setFormState(v => {
            return {
                ...v,
                rounds: v.rounds.map(r => {
                    if (r.name === round.name) {
                        r.type = roundType;
                    }

                    return r;
                })
            };
        });
    }

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
                                            disabled
                                            value={'Тимур Фролов'} 
                                            // onChange={(e) => setFormState({ ...formState, organizer: e.target.value })}
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
                                            setFormState({ ...formState, date: (date.toDate()) })
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
                                    value='Казань'
                                    disabled
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
                                {/* <div className="event">
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
                                </div> */}
                            </div>
                        </div>

                        <div className="rounds-header">
                            <div className="add-round-btn">
                                Раунды 3х3
                            </div>
                            <div>
                                <button className="add-round-btn" onClick={addNewRound}>
                                    +
                                </button>
                            </div>
                            <div>
                                <button className="add-round-btn" onClick={removeRound}>
                                    -
                                </button>
                            </div>
                        </div>

                        <table className="rounds-table">
                            <tbody>
                                <tr className="empty"></tr>
                                {roundItems}
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
