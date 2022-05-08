import moment from "moment";
import { useEffect, useState } from "react";
import "./EditContestForm.scss";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TextField } from "@mui/material";
import { RoundType } from "../models/state";
import { useNavigate, useParams } from "react-router-dom";

type RoundItem = {
    name: string,
    type: RoundType,
}

type ContestFormState = {
    name: string,
    city: string,
    date: Date,
    vkLink: string,
    organizedById: any,
    organizedBy: any,
    rounds: RoundItem[],
}

// TODO
// make organizator as an autocomplete input
// test date locales
// add form validation
// add other events, 4x4, 5x5 etc
// add loading indicator
const EditContestForm = () => {
    let navigate = useNavigate();
    const { id } = useParams();
    const idNumber =  Number(id);

    const availableRounds: RoundItem[] = [
        { name: '3x3 финал', type: RoundType.AVERAGE_OF_5 },
        { name: '3x3 полуфинал', type: RoundType.AVERAGE_OF_5  },
        { name: '3x3 первый раунд', type: RoundType.AVERAGE_OF_5  },
    ];

    const [ formState, setFormState ] = useState<ContestFormState>({
        name: '',
        city: 'Казань',
        date: new Date(),
        vkLink: '',
        organizedById: 3,
        organizedBy: null,
        rounds: [availableRounds[0]],
    });

    useEffect(() => {
        if (idNumber > 0) {
            fetch(`http://localhost:3000/contests/${id}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            })
                .then(r => r.json())
                .then(res => {
                    setFormState({
                        name: res.name,
                        city: res.city,
                        date: res.date,
                        vkLink: res.vkUrl,
                        organizedById: 3,
                        organizedBy: null,
                        rounds: res.rounds ?? []
                    })
                });
        }
    }, []);

    const handleSubmit = async () => {
        const formData = {
            "name": formState.name,
            "vkUrl": formState.vkLink,
            "date": formState.date,
            "city": formState.city,
            "rounds": formState.rounds,
            "organizedById": formState.organizedById,
        };

        let response;

        if (idNumber === 0) {
            response = await fetch(`http://localhost:3000/contests/`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });
        } else {
            response = await fetch(`http://localhost:3000/contests/${id}`,
            {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });
        }

        if (!response.ok) return;

        navigate('../contests');
    }

    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
    });

    const addNewRound = () => {
        const addedRounds = formState.rounds;
        const newRounds = [ availableRounds[addedRounds.length], ...addedRounds ];

        setFormState({
            ...formState,
            rounds: newRounds,
        })
    }

    const removeRound = () => {
        const newRounds = [...formState.rounds];
        newRounds.shift();

        setFormState({
            ...formState,
            rounds: newRounds,
        });
    }

    const setRoundType = (round: RoundItem, roundType: RoundType) => {
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

    return (
        <>
            <div className="info-container">
                {idNumber === 0 ? 'Создание нового контеста' : 'Редактирование контеста'}
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
                            shouldDisableDate={(date: moment.Moment) => {
                                // disable previous days, but allow today
                                const today = moment().toDate();
                                today.setHours(0);
                                today.setMinutes(0);
                                today.setSeconds(0);
                                today.setMilliseconds(0);

                                const calendarDate = date.toDate();
                                calendarDate.setHours(0);
                                calendarDate.setMinutes(0);
                                calendarDate.setSeconds(0);
                                calendarDate.setMilliseconds(0);

                                return calendarDate < today;
                            }}
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
                                раунды ({formState.rounds.length})
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounds-header">
                    <div className="add-round-btn">
                        Раунды 3х3
                    </div>
                    <div>
                        <button className="round-btn" onClick={addNewRound} disabled={formState.rounds.length === 3}>
                            +
                        </button>
                    </div>
                    <div>
                        <button className="round-btn" onClick={removeRound} disabled={formState.rounds.length === 1}>
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
                    <button onClick={() => { navigate('../contests'); }}>
                        Назад к списку
                    </button>
                    <div className="img-container"></div>
                    <button onClick={async () => {
                        await handleSubmit();
                    }}>
                        Сохранить
                    </button>
                </div>
            </div>
        </>
    );
}

export default EditContestForm;
