import moment from "moment";
import { useEffect, useState } from "react";
import "./EditContestForm.scss";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TextField } from "@mui/material";
import { ErrorHandlerProps, RoundType, Notification, User } from "../models/state";
import { useNavigate, useParams } from "react-router-dom";
import FormButton from "./shared/FormButton";
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

type RoundItem = {
    name: string,
    type: RoundType,
}

type ContestFormState = {
    name: string,
    city: string,
    date: Date,
    vkLink: string,
    organizedById: number | null,
    rounds: RoundItem[],
    allUserOptions: UserOption[],
}

interface UserOption {
    displayName: string
    userId: number,
    disabled: boolean,
}

// TODO
// test date locales
// add other events, 4x4, 5x5 etc
// add loading indicator
const EditContestForm = (props: ErrorHandlerProps) => {
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
        organizedById: null,
        rounds: [availableRounds[0]],
        allUserOptions: [],
    });

    const [ selectedUserOption, setSelectedUserOption ] = useState<UserOption | null>(null);
    const filterUser = createFilterOptions<UserOption>();
    const addParticipantText = 'Создать участника: ';

    useEffect(() => {
        const getContestInfo = idNumber > 0 
            ? fetch(`http://localhost:3000/contests/${id}`, 
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            })
            : Promise.resolve(null);

        const getUsers = fetch(`http://localhost:3000/users`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })

        // TODO refactor - when there are too many users, it will slow down the app. Do not load all users at once
        Promise.all([getContestInfo, getUsers])
            .then(r => Promise.all(r.map(res => !res ? Promise.resolve(null) : res.json())))
            .then(([contestInfo, users]) => {
                if (contestInfo) {
                    // populate form with contest data
                    setFormState({
                        name: contestInfo.name,
                        city: contestInfo.city,
                        date: contestInfo.date,
                        vkLink: contestInfo.vkUrl,
                        organizedById: contestInfo.organizedById,
                        rounds: contestInfo.rounds,
                        allUserOptions: [],
                    });

                    // preselect organizer autocomplete with contest data
                    setSelectedUserOption({ 
                        userId: contestInfo.organizedById, 
                        disabled: false, 
                        displayName: getUserDisplayName(users.find((u: User) => u.id === contestInfo.organizedById)),
                    })
                }

                setFormState(state => {
                    return {
                        ...state,
                        allUserOptions: users.map((u: User) => {
                            return { displayName: getUserDisplayName(u), userId: u.id, disabled: false };
                        }),
                    }
                })
            });
    }, []);

    console.log(formState);
    
    const getUserDisplayName = (user: User): string => {
        return `${user.firstName} ${user.lastName}`;
    }

    // TODO add other types of notifications
    // combine methods into centralized error handler from different components
    const addNotification = (notification: Notification) => {
        props.setNotifications((notifications: Notification[]) => {
            return [
                ...notifications,
                notification,
            ]
        });
    }

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

        if (!response.ok) {
            addNotification({ message: 'Произошла ошибка при сохранении контеста. Повторите попытку позже.' });
        };

        navigate('../contests');
    }

    // TODO add themes on a global app level
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

    const isFormValid = () => {
        return !!formState.city && !!formState.name && formState.organizedById !== null;
    }

    const roundItems = formState.rounds?.map(r => {
        return (
            <tr key={r.name} className="round-row">
                <td> </td>
                <td>
                    {r.name}
                </td>
                {/* TODO add different round formats     */}
                {/* <td>
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
                            disabled={true}
                            name={r.name}
                            id="r1"
                            checked={r.type === RoundType.MEAN_OF_3}
                            onChange={() => setRoundType(r, RoundType.MEAN_OF_3)}
                        />
                        <label htmlFor="r1"> среднее из 3</label>
                    </div>
                </td>
                <td className="empty"></td> */}
            </tr>
        )
    });

    return (
        <>
            <ThemeProvider theme={darkTheme}>
            <div className="info-container">
                {idNumber === 0 ? 'Создание нового контеста' : 'Редактирование контеста'}
            </div>
            <div inline-datepicker="true" data-date="02/25/2022"></div>
            <div className="create-contest-form">
                <table className="main-info-table">
                    <tbody>
                        <tr>
                            <td>
                                <label id="organizer-label" htmlFor="organizer-input">Организатор *</label>
                            </td>
                            <td>
                                <Autocomplete 
                                    className="organizer-input"
                                    filterOptions={(_, params) => {
                                        const { inputValue } = params;

                                        // do not show anything until user types 3 symbols
                                        if (inputValue.length < 3) 
                                            return [ { displayName: `Введите мин. 3 символа`, userId: 0, disabled: true } ];

                                        // show loading indicator
                                        // TODO test with slow backend responses
                                        if (!formState.allUserOptions.length) 
                                            return [ { displayName: 'Загрузка...', userId: 0, disabled: true }];

                                        const filtered = filterUser(formState.allUserOptions, params);

                                        // add participant opion
                                        if (!filtered.length) 
                                            return [ { displayName: `${addParticipantText}${inputValue}`, userId: 0, disabled: false } ];

                                        return filtered;
                                    }}
                                    getOptionLabel={(option) => {
                                        return option.displayName;
                                    }}
                                    value={selectedUserOption}
                                    onChange={(_, option) => {
                                        setSelectedUserOption(option);

                                        setFormState(state => {
                                            return {
                                                ...state,
                                                organizedById: option?.userId ?? 0,
                                            }
                                        })
                                    }}      
                                    options={[]}
                                    renderInput={(params) => {
                                        // vs code complains about value property of inputProps here, so add 'any'
                                        const props = params.inputProps as any;
                                        const optionDisplayValue = props.value;
                                        
                                        // remove add participant text after selection
                                        if (optionDisplayValue.indexOf(addParticipantText) > -1) {
                                            props.value = optionDisplayValue.split(addParticipantText)[1];
                                        }

                                        return (
                                            <TextField {...params} label="Выберите пользователя:" />
                                        )
                                    }}
                                    renderOption={(props, option) => {
                                        const { displayName } = option;
                                        return (
                                          <span {...props} style={{ color: '#bcb7b7' }}>
                                            {displayName}
                                          </span>
                                        );
                                    }}
                                    getOptionDisabled={(option) => option.disabled}
                                />
                            </td>
                            <td>
                                <label className="date-label">Дата проведения</label>
                            </td>
                            <td>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
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
                            </td>
                        </tr>
                        <tr className="empty"></tr>
                        <tr>
                            <td>
                                <label id="name-label" htmlFor="name-input">Название *</label>
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
                            <td>
                                <label id="city-label" htmlFor="city-input">Город *</label>
                            </td>

                            <td>
                                <input
                                    id="city-input"
                                    type="text"
                                    value='Казань'
                                    disabled
                                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                                />
                            </td>
                        </tr>
                        <tr className="empty"></tr>
                    </tbody>
                </table>

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
                    <FormButton onClick={() => { navigate('../contests'); }} disabled={false} text="Назад к списку"></FormButton>
                    <FormButton onClick={async () => { await handleSubmit(); }} disabled={!isFormValid()} text="Сохранить"></FormButton>
                </div>
            </div>
            </ThemeProvider>
        </>
    );
}

export default EditContestForm;
