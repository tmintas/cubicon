import { useEffect, useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ADD_NEW_USER_OPTION_VALUE, Contest, ErrorHandlerProps, User, UserOption } from '../models/state';
import './EditResults.scss';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormButton from './shared/FormButton';
import { DNF, DNS, DNF_DISPLAY_VALUE, DNS_DISPLAY_VALUE } from '../constants';
import ErrorIcon from '@mui/icons-material/Error';
import { Notification } from '../models/state';
import UsersAutocomplete from './shared/UsersAutocomplete';
import { toDelimitedString, getBestAndAverage, toMilliseconds } from '../services/results-service';

// problem - while selecting an existing user we should mark his result as editing. This is hard for new users with curremt implemetation
// try to replace perfById with userOption

// TODO use this model for input row only. The values should not be null for the results
type ResultUIItem = {
    id: number | null,
    attempt1: string | null,
    attempt2: string | null,
    attempt3: string | null,
    attempt4: string | null,
    attempt5: string | null,
    best: string | null,
    average: string | null,
    performedById: number | null,
    roundId: number,

    // indicates that the result is being edited
    isEditing: boolean,

    // indicates that the result was added using UI and not sent to backend yet
    isAdded: boolean,

}

type ResulstFormState = {
    loaded: boolean,

    // contest info loaded from backend
    contest: Contest | null,

    selectedRoundId: number,
    contestResults: ResultUIItem[],
    editingResult: ResultUIItem,
}

type ResultsComponentProps = ErrorHandlerProps & {
    isEditingMode: boolean,
}

// TODO use react-hook-form for form handling
// TODO add validation error messages
// TODO add tooltips
const EditResults = (props: ResultsComponentProps) => {
    const { setNotifications, isEditingMode } = props;
    
    const navigate = useNavigate();
    const { id: contestId } = useParams();

    const [ params ] = useSearchParams();
    const isAdmin: boolean = params.get('isAdmin') === 'true';
    const showUpcoming: boolean = params.get('showUpcoming') === 'true';

    const defaultEditingResult = {
        id: null,
        performedById: null,
        // performedBy: null,
        attempt1: null,
        attempt2: null,
        attempt3: null,
        attempt4: null,
        attempt5: null,
        best: null,
        average: null,
        isValid: false,
        isEditing: false,
        isAdded: false,
        roundId: 0,
    };

    const [ state, setState ] = useState<ResulstFormState>({
        loaded: false,
        contest: null,
        selectedRoundId: 0,
        contestResults: [],
        editingResult: defaultEditingResult,
    });
    const [ selectedUserOption, setSelectedUserOption ] = useState<UserOption | null>(null);
    const [ allUserOptions, setAllUserOptions ] = useState<UserOption[]>([]);

    useEffect(() => {
        if (contestIdNumber > 0) {
            const getContest = fetch(`http://localhost:3000/contests/${contestIdNumber}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            }).then(r => r.json());

            const getUsers = fetch(`http://localhost:3000/users`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            }).then(r => r.json());

            // TODO error handling
            Promise.all([ getContest, getUsers ])
                .then(([contest, users]) => {
                    // TODO find a way to preserve return types
                    setAllUserOptions(users.map((u: User) => {
                        return new UserOption(u.id, false, u.firstName, u.lastName);
                    }));

                    const contestResults = (contest as Contest).rounds.flatMap(round => round.results).map(r => {
                        const resultUIItem = {
                            id: r.id,
                            attempt1: toDelimitedString(r.attempt1),
                            attempt2: toDelimitedString(r.attempt2),
                            attempt3: toDelimitedString(r.attempt3),
                            attempt4: toDelimitedString(r.attempt4),
                            attempt5: toDelimitedString(r.attempt5),
                            best: toDelimitedString(r.best),
                            average: toDelimitedString(r.average),
                            performedById: r.performedById,
                            roundId: r.roundId,
                        } as ResultUIItem;

                        return resultUIItem;
                    });

                    setState({
                        loaded: true,
                        contest,
                        selectedRoundId: contest.rounds[0].id,
                        contestResults,
                        editingResult: defaultEditingResult,
                    });
                })
                .catch(() => {
                    addNotification({ message: 'Произошла ошибка при загрузке контеста. Повторите попытку позже.' });
                });
        }
    }, []);

    // TODO add other types of notifications
    // combine methods from different components
    const addNotification = (notification: Notification) => {
        setNotifications((notifications: Notification[]) => {
            return [
                ...notifications,
                notification,
            ]
        });
    }
    
    const getAttemptsMs = (result: ResultUIItem) => {
        return [ 
            toMilliseconds(result.attempt1), 
            toMilliseconds(result.attempt2), 
            toMilliseconds(result.attempt3), 
            toMilliseconds(result.attempt4), 
            toMilliseconds(result.attempt5)
        ];
    }

    // event handlers
    const onRoundSelect = (roundId: number) => {
        onClearResultClick();

        setState(state => {
            return {
                ...state,
                selectedRoundId: roundId,
            };
        });
    }

    const onAddResultClick = () => {
        let newResult: ResultUIItem = { 
            ...editingResult, 
            best: toDelimitedString(
                getBestAndAverage(
                    getAttemptsMs(editingResult)
                )[0]
            ),
            average: toDelimitedString(
                getBestAndAverage(
                    getAttemptsMs(editingResult)
                )[1]
            ),
            roundId: state.selectedRoundId, 
            isAdded: true 
        };

        setState(state => {
            return {
                ...state,
                contestResults: [...state.contestResults, newResult]
            }
        });

        onClearResultClick();
    }

    const onClearResultClick = () => {
        setState(state => {
            return {
                ...state,
                editingResult: defaultEditingResult,
                contestResults: [...state.contestResults].map(r => {
                    r.isEditing = false;
                    return r;
                }),
            }
        });

        setSelectedUserOption(null);
    }

    const onResultSaveClick = () => {        
        setState(state => {
            return {
                ...state,
                editingResult: defaultEditingResult,
                contestResults: [...state.contestResults.map(r => {
                    if (r.isEditing) {
                        const attemptsMs = getAttemptsMs(editingResult);

                        const updatedItem: ResultUIItem = {
                            ...editingResult,
                            best: toDelimitedString(getBestAndAverage(attemptsMs)[0]),
                            average: toDelimitedString(getBestAndAverage(attemptsMs)[1]),
                        };

                        return updatedItem;
                    } else {
                        return r;
                    }
                })]
            }
        })

        onClearResultClick();
    }

    const onAttemptChange = (attemptNumber: number, event: any) => {
        const attemptRawInput = event.target.value;
        const attemptKey = `attempt${attemptNumber}`;
        
        setState((state) => {
            return {
                ...state,
                editingResult: {
                    ...editingResult,
                    [attemptKey]: attemptRawInput,
                },
            };
        });
    }

    const onCompetitorSelect = (userOption: UserOption | null) => {
        console.log('current options');
        console.log(allUserOptions);
        
        console.log('selected option');
        console.log(userOption);
      
        // TODO probably all 3 state updates can be done using only one entry, e.g - userOption.selected
        // add a new user to the dropdown options so he can be selected in other rounds
        if (!!userOption && !allUserOptions.find(uo => uo.firstName === userOption.firstName && uo.lastName === userOption.lastName)) {
            userOption.manuallyCreated = true;

            setAllUserOptions(userOptions => {
                return [ ...userOptions, userOption ];
            });
        }

        setSelectedUserOption(userOption);

        setState(state => {
            return {
                ...state,
                editingResult: {
                    ...editingResult,
                    performedById: userOption?.userId ?? null
                },
            }
        })
    }

    const onDeleteResultClick = (result: ResultUIItem) => {
        setState((state) => {
            return {
                ...state,
                contestResults: state.contestResults.filter(r => r !== result),
                editingResult: defaultEditingResult,
            };
        });
    }

    const onEditResultClick = (result: ResultUIItem) => {
        setState((state) => {
            return {
                ...state,
                editingResult: result,
                contestResults: [...state.contestResults].map(r => {
                    if (r.performedById === result.performedById && r.roundId === state.selectedRoundId) {
                        r.isEditing = true;
                        return r;
                    } else {
                        r.isEditing = false;
                        return r;
                    }
                }),
            };
        });

        const userOption = allUserOptions.find(uo => uo.userId === result.performedById) as UserOption;
        setSelectedUserOption(userOption);
    }

    const onUserClick = (userId: number | null) => {
        if (!userId) return;

        navigate(`../users/${userId}`);
    }

    const onSubmitClick = async () => {
        const results = state.contestResults.map(r => {
            const attemptsMs: number[] = getAttemptsMs(r);

            let result = {
                id: r.id,
                roundId: r.roundId,
                attempt1: attemptsMs[0],
                attempt2: attemptsMs[1],
                attempt3: attemptsMs[2],
                attempt4: attemptsMs[3],
                attempt5: attemptsMs[4],
                best: getBestAndAverage(attemptsMs)[0],
                average: getBestAndAverage(attemptsMs)[1],
                performedById: r.performedById,
            };

            return result;
        });

        console.log(results);
        
        const res = await fetch(`http://localhost:3000/results/${state.contest?.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(results),
        });

        if (!res.ok) {
            addNotification({ message: 'Произошла ошибка при сохранении результатов. Повторите попытку позже.' });
        }

        goToContestsList();
    }

    const onGoBackClick = () => {
        goToContestsList();
    }

    const goToContestsList = () => {
        navigate(`../contests?showUpcoming=${showUpcoming ? 'true': 'false'}&isAdmin=${isAdmin ? 'true' : 'false'}`);
    }

    // UI variables
    // valid values: '9.43', '19.43', '1:19.03', '12:19.03', '59:19.03', DNF, DNS
    const isAttemptInputValid = (rawValue: string | null) => {
        if (!rawValue) return false;

        if (rawValue === DNF_DISPLAY_VALUE || rawValue === DNS_DISPLAY_VALUE) return true;

        const containsOnlyAllowed = /^[\d:\.S]+$/.test(rawValue);
        const chars: string[] = rawValue.split('');
        const isOrderCorrect = chars.indexOf(':') < chars.indexOf('.');
        const specialCharsCount = chars.filter((c: string) => c === ':' || c === '.').length;
        const delimitedByMinute = rawValue.split(':');

        return containsOnlyAllowed && 
            (specialCharsCount === 1 || specialCharsCount === 2) && 
            isOrderCorrect && 
            // there are exactly 2 signs after dot
            rawValue.split('.')[1].length === 2 && 
            (
                // no minutes
                delimitedByMinute.length === 1 || 
                // if minutes are present, the other criterias should be met
                (
                    delimitedByMinute.length === 2 && 
                    // after minutes there are exactly 5 chars
                    delimitedByMinute[1].length === 5 && 
                    // minutes are 1- or 2-signed
                    (delimitedByMinute[0].length === 1 || delimitedByMinute[0].length === 2)
                )
            );
    };

    const contestIdNumber = Number(contestId);
    const editingResult = state.editingResult;

    const sortResults = (previous: ResultUIItem, next: ResultUIItem) => {
        const avg1 = toMilliseconds(previous.average);
        const avg2 = toMilliseconds(next.average);
        const best1 = toMilliseconds(previous.best);
        const best2 = toMilliseconds(next.best);

        // if both averages are DNF/DNS, sort by bests
        if (avg1 < 0 && avg2 < 0) {
            // if both bests are DNF/DNS, sort by competitor names
            if (best1 < 0 && best2 < 0) {
                return !!previous.performedById && !!next.performedById && previous.performedById > next.performedById ? 1 : DNF;
            }

            return !!best1 && !!best2 && best1 > best2 ? 1 : DNF;
        }

        return !!avg1 && !!avg2 && avg2 !== DNF && avg2 !== DNS && avg1 > avg2 ? 1 : -1;
    }

    const selectedRoundResults = state.contestResults
        .filter(r => r.roundId === state.selectedRoundId)
        .sort((a, b) => sortResults(a, b));

    // TODO add validation messages to the user
    const isEditingResultValid = [
        editingResult.attempt1, 
        editingResult.attempt2,
        editingResult.attempt3,
        editingResult.attempt4,
        editingResult.attempt5,
    ].every(i => isAttemptInputValid(i)) && editingResult.performedById !== null && 
        // only one result for a user is allowed
        selectedRoundResults.every(r => r.performedById !== editingResult.performedById || r.isEditing || r.performedById === 0);

    const newResultIsCleared = !editingResult.attempt1 && !editingResult.attempt2 && !editingResult.attempt3 && 
        !editingResult.attempt4 && !editingResult.attempt5 && !editingResult.performedById;

    console.log('all uos');
    console.log(allUserOptions);

    const roundHasResults = (roundId: number) => {
        return state.contestResults.some(r => r.roundId === roundId);
    }

    // TSX elements
    const getActionIcons = (result: ResultUIItem) => { 
        return (
            <>
                <td className='td-action'> 
                <EditIcon 
                    className={`icon ${result.isEditing && 'editing'}`} 
                    onClick={() => { onEditResultClick(result); }}>
                </EditIcon>
            </td>
            <td className='td-action'> 
                <DeleteForeverIcon 
                    className="icon" 
                    onClick={() => { onDeleteResultClick(result); }}
                ></ DeleteForeverIcon>
            </td>
            </>
        );
    };

    const inputRowCells = !editingResult ? <div>empty</div> :
        <>
            <td>
                <UsersAutocomplete 
                    allUserOptions={allUserOptions} 
                    selectedUserOption={selectedUserOption}
                    onUserSelect={onCompetitorSelect}
                    addNewUserOptionValue={ADD_NEW_USER_OPTION_VALUE}
                >
                </UsersAutocomplete>
            </td>
            <td></td>
            <td></td>
            <td>
                <input
                    className="res-input"
                    type="text"
                    value={state.editingResult.attempt1 ?? ''}
                    onChange={(e) => { onAttemptChange(1, e); }}
                />
            </td>
            <td>
                <input
                    className="res-input"
                    type="text"
                    value={state.editingResult.attempt2 ?? ''}
                    onChange={(e) => { onAttemptChange(2, e); }}
                />
            </td>
            <td>
                <input
                    className="res-input"
                    type="text"
                    value={state.editingResult.attempt3 ?? ''}
                    onChange={(e) => { onAttemptChange(3, e); }}
                />
            </td>
            <td>
                <input
                    className="res-input"
                    type="text"
                    value={state.editingResult.attempt4 ?? ''}
                    onChange={(e) => { onAttemptChange(4, e); }}
                />
            </td>
            <td>
                <input
                    className="res-input"
                    type="text"
                    value={state.editingResult.attempt5 ?? ''}
                    onChange={(e) => { onAttemptChange(5, e); }}
                />
            </td>
            <td>
                {
                    !!editingResult.id || editingResult.isAdded
                        ? <button className='inline-button' disabled={!isEditingResultValid} onClick={onResultSaveClick}>
                            <CheckCircleIcon
                                className={`icon ${!isEditingResultValid && 'disabled'}`}
                                fontSize='small'
                            >
                            </CheckCircleIcon>
                        </button>
                        : <button className='inline-button' disabled={!isEditingResultValid} onClick={onAddResultClick}>
                            <AddCircleIcon 
                                className={`icon ${!isEditingResultValid && 'disabled'}`}
                                fontSize='small' 
                            >
                            </AddCircleIcon>
                        </button> 
                }
            </td>
            <td>
                <CancelIcon
                    className={`icon ${newResultIsCleared && 'disabled'}`}
                    fontSize='small' 
                    onClick={onClearResultClick}
                >
                </CancelIcon>
            </td>
        </>

    const roundTabs =
        <div className='round-tabs'>{
            state.contest?.rounds.map(r => (
                <div 
                    key={r.id}
                    className={`tab ${r.id === state.selectedRoundId && 'active'}`} 
                    onClick={() => onRoundSelect(r.id)}
                >
                {r.name}
                { 
                    props.isEditingMode && 
                    <ErrorIcon className='error-icon' style={{visibility: roundHasResults(r.id) ? 'hidden' : 'visible' }}>
                    </ErrorIcon>
                }
                </div>)
            )}
        </div>

    // TODO create fancy spinner
    if (!state.loaded) return <div>Загрузка...</div>;

    // TODO create empty box
    if (!state.contest) return <div>Контест не найде, попробуйте попытку позже.</div>;

    else return (
        <>
            <div className='info-container'>
                {state.contest.name} { props.isEditingMode ? ' - ввод результатов' : ' - результаты' }
            </div>
            {roundTabs}

            <div className='results-container'>
                <table className='results-table'>
                    <thead>
                        <tr>
                            <th style={{width: '45px'}}>Место</th>
                            <th style={{width: '220px'}}>Участник</th>
                            <th style={{width: '120px'}}>Лучшая</th>
                            <th style={{width: '120px'}}>Среднее</th>
                            <th colSpan={5} style={{width: '370px'}}>Сборки</th>
                            { isEditingMode && <th colSpan={2} style={{width: '100px'}}></th>}
                        </tr>
                    </thead>

                    <tbody>
                        {selectedRoundResults.map((r, i) => {
                            return (
                                <tr key={i}>
                                    <td className='td-order'>{++i}</td>
                                    <td className='td-name' onClick={() => onUserClick(r.performedById)}>
                                        <p className='user-name'>
                                            { allUserOptions.find(uo => uo.userId === r.performedById)?.displayName ?? '' }
                                        </p>
                                    </td>
                                    <td className='td-res'>{r.best}</td>
                                    <td className='td-res'>{r.average}</td>
                                    <td className='td-res'>{r.attempt1}</td>
                                    <td className='td-res'>{r.attempt2}</td>
                                    <td className='td-res'>{r.attempt3}</td>
                                    <td className='td-res'>{r.attempt4}</td>
                                    <td className='td-res'>{r.attempt5}</td>
                                    { isEditingMode && getActionIcons(r) }
                                </tr>
                            )
                        })}
                        {isEditingMode && <>
                            <tr></tr>
                            <tr className='input-row'>
                                <td></td>
                                {inputRowCells}
                            </tr>
                        </>}
                    </tbody>
                </table>

                <div className="actions-container">
                    <FormButton onClick={onGoBackClick} disabled={false} text="Назад к списку"></FormButton>
                   {
                        isEditingMode && 
                        <FormButton 
                            disabled={state.contest.rounds.some(r => !roundHasResults(r.id))} 
                            text="Сохранить результаты"
                            onClick={onSubmitClick}></FormButton>
                    }
                </div>
            </div>
        </>
    )
}

export default EditResults;