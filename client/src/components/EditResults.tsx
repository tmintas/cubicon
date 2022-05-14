import { useEffect, useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useParams } from 'react-router-dom';
import { Contest, Result } from '../models/state';
import './EditResults.scss';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormButton from './shared/FormButton';

type ResultUIItem = {
    id: number | null,
    attempt1: string | null,
    attempt2: string | null,
    attempt3: string | null,
    attempt4: string | null,
    attempt5: string | null,
    best: string | null,
    average: string | null,

    // indicates that the result is being edited
    isEditing: boolean,

    // indicates that the result was added using UI and not sent to backend yet
    isAdded: boolean,

    // TODO make id instead of string
    performedBy: string | null,

    roundId: number,
}

type ResultsTableState = {
    loaded: boolean,

    // contest info loaded from backend
    contest: Contest | null,

    selectedRoundId: number,
    contestResults: ResultUIItem[],
    editingResult: ResultUIItem,
}

// TODO use react-hook-form for form handling
// TODO add validation error messages
// TODO add tooltips
const EditResults = () => {
    const { id: contestId } = useParams();
    const defaultEditingResult = {
        id: null,
        performedBy: null,
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

    const [ state, setState ] = useState<ResultsTableState>({
        loaded: false,
        contest: null,
        selectedRoundId: 0,
        contestResults: [],
        editingResult: defaultEditingResult,
    });

    const contestIdNumber = Number(contestId);
    const editingResult = state.editingResult;
    const selectedRoundResults = state.contestResults.filter(r => r.roundId === state.selectedRoundId);

    useEffect(() => {
        if (contestIdNumber > 0) {
            fetch(`http://localhost:3000/contests/${contestIdNumber}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            })
                .then(r => r.json())
                .then((contest: Contest) => {
                    setState({
                        loaded: true,
                        contest,
                        selectedRoundId: contest.rounds[0].id,
                        // TODO load results from backend
                        // TODO check other rounds from the contest
                        contestResults: [{
                            id: 1,
                            performedBy: 'Тимур Фролов',
                            attempt1: '14.22',
                            attempt2: '15.22',
                            attempt3: '9.77',
                            attempt4: '15.66',
                            attempt5: '11.61',
                            best: '15.55',
                            average: '16.55',
                            isEditing: false,
                            isAdded: false,
                            roundId: 74,
                        }],
                        editingResult: defaultEditingResult,
                    });
                });
        }
    }, []);

    const toMilliseconds = (resultRaw: string | null) => {
        if (!resultRaw) return 0;

        const milliseconds: number = +resultRaw.split('.')[1];

        const minutesAndSeconds = resultRaw.split('.')[0];
        let seconds: number;
        let minutes = 0;

        if (minutesAndSeconds.indexOf(':') === -1) {
            seconds = +minutesAndSeconds;
        } else {
            minutes = +minutesAndSeconds.split(':')[0];
            seconds = +minutesAndSeconds.split(':')[1];
        }

        return minutes * 6000 + seconds * 100 + milliseconds;
    }

    const getBestAndAverage: (result: ResultUIItem) => [number, number] = (result: ResultUIItem) => {
        const result1Ms = toMilliseconds(result.attempt1 as string);
        const result2Ms = toMilliseconds(result.attempt2 as string);
        const result3Ms = toMilliseconds(result.attempt3 as string);
        const result4Ms = toMilliseconds(result.attempt4 as string);
        const result5Ms = toMilliseconds(result.attempt5 as string);

        const results = [ result1Ms, result2Ms, result3Ms, result4Ms, result5Ms ];
        const worst = results.reduce((prev, cur) => cur > prev ? cur : prev, results[0]);
        const best = results.reduce((prev, cur) => cur < prev ? cur : prev, results[0]);

        const withoutBestAndWorst: number[] = results.filter((_, i) => i !== results.indexOf(worst) && i !== results.indexOf(best));

        const avg = Math.floor(withoutBestAndWorst.reduce((prev, cur) => prev + cur, 0) / 3);
        
        return [best, avg];
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
        let newResult = { ...state.editingResult, roundId: state.selectedRoundId, isAdded: true };

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
        })
    }

    const onResultSave = () => {        
        setState(state => {
            return {
                ...state,
                editingResult: defaultEditingResult,
                contestResults: [...state.contestResults.map(r => r.isEditing ? state.editingResult : r)]
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
                    ...state.editingResult,
                    [attemptKey]: attemptRawInput,
                },
            };
        });
    }

    const onNameChange = (event: any) => {
        const performedBy = event.target.value as string;

        setState((state) => {
            return {
                ...state,
                editingResult: {
                    ...editingResult,
                    performedBy,
                },
            };
        });
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
                    if (r.performedBy === result.performedBy && r.roundId === state.selectedRoundId) {
                        r.isEditing = true;
                        return r;
                    } else {
                        r.isEditing = false;
                        return r;
                    }
                }),
            };
        });
    }

    const onSubmitClick = () => {
        const results = state.contestResults.map(r => {
            let result = {
                attempt1: toMilliseconds(r.attempt1),
                attempt2: toMilliseconds(r.attempt2),
                attempt3: toMilliseconds(r.attempt3),
                attempt4: toMilliseconds(r.attempt4),
                attempt5: toMilliseconds(r.attempt5),
                best: getBestAndAverage(r)[0],
                average: getBestAndAverage(r)[1],
                performedByStr: r.performedBy
            };

            return result;
        });
    }

    // UI variables
    // valid values: '9.43', '19.43', '1:19.03', '12:19.03', '59:19.03'
    const isAttemptInputValid = (rawValue: string | null) => {
        if (!rawValue) return false;

        const containsOnlyAllowed = /^[\d:\.]+$/.test(rawValue);
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

    const isEditingResultValid = [
        state.editingResult.attempt1, 
        state.editingResult.attempt2,
        state.editingResult.attempt3,
        state.editingResult.attempt4,
        state.editingResult.attempt5,
    ].every(i => isAttemptInputValid(i)) && !!state.editingResult.performedBy && 
        selectedRoundResults.every(r => r.performedBy !== state.editingResult.performedBy || r.isEditing);

    const newResultIsCleared = !editingResult.attempt1 && !editingResult.attempt2 && !editingResult.attempt3 && 
        !editingResult.attempt4 && !editingResult.attempt5 && !editingResult.performedBy;

    // TSX elements
    const inputRowCells = !state.editingResult ? <div>empty</div> :
        <>
            <td>
                <input
                    type="text"
                    className="name-input"
                    value={state.editingResult.performedBy ?? ''}
                    onChange={(e) => { onNameChange(e); }}
                />
            </td>
            <td></td>
            <td></td>
            <td>
                <input
                    type="text"
                    value={state.editingResult.attempt1 ?? ''}
                    onChange={(e) => { onAttemptChange(1, e); }}
                />
            </td>
            <td>
                <input
                    type="text"
                    value={state.editingResult.attempt2 ?? ''}
                    onChange={(e) => { onAttemptChange(2, e); }}
                />
            </td>
            <td>
                <input
                    type="text"
                    value={state.editingResult.attempt3 ?? ''}
                    onChange={(e) => { onAttemptChange(3, e); }}
                />
            </td>
            <td>
                <input
                    type="text"
                    value={state.editingResult.attempt4 ?? ''}
                    onChange={(e) => { onAttemptChange(4, e); }}
                />
            </td>
            <td>
                <input
                    type="text"
                    value={state.editingResult.attempt5 ?? ''}
                    onChange={(e) => { onAttemptChange(5, e); }}
                />
            </td>
            <td>
                {
                    !!editingResult.id || editingResult.isAdded
                        ? <button className='inline-button' disabled={!isEditingResultValid} onClick={onResultSave}>
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

    // TODO create fancy spinner
    if (!state.loaded) return <div>loading...</div>;

    // TODO create empty box
    if (!state.contest) return <div>contet is empty...</div>;

    else return (
        <>
            <div className='info-container'>
                {state.contest.name} - результаты
            </div>

            <div className='round-tabs'>
                {
                    state.contest.rounds.map(r => {
                        return (
                            <div 
                                key={r.id}
                                className={`tab ${r.id === state.selectedRoundId && 'active'}`} 
                                onClick={() => onRoundSelect(r.id)}
                            >
                                {r.name}
                            </div>
                        )
                    })
                }
            </div>

            <div className='results-container'>
                <table className='results-table'>
                    <thead>
                        <tr>
                            <th style={{width: '45px'}}>Место</th>
                            <th style={{width: '220px'}}>Участник</th>
                            <th style={{width: '120px'}}>Лучшая</th>
                            <th style={{width: '120px'}}>Среднее</th>
                            <th colSpan={5}>Сборки</th>
                            <th colSpan={2} style={{width: '100px'}}></th>
                        </tr>
                    </thead>

                    <tbody>
                        {selectedRoundResults.map((r, i) => {
                            return (
                                // TODO use id
                                <tr key={i}>
                                    <td className='td-order'>{i+1}</td>
                                    <td className='td-name'>{r.performedBy}</td>
                                    <td className='td-res'>{r.best}</td>
                                    <td className='td-res'>{r.average}</td>
                                    <td className='td-res'>{r.attempt1}</td>
                                    <td className='td-res'>{r.attempt2}</td>
                                    <td className='td-res'>{r.attempt3}</td>
                                    <td className='td-res'>{r.attempt4}</td>
                                    <td className='td-res'>{r.attempt5}</td>
                                    <td className='td-action'> 
                                        <EditIcon 
                                            className={`icon ${r.isEditing && 'editing'}`} 
                                            onClick={() => { onEditResultClick(r); }}>
                                        </EditIcon>
                                    </td>
                                    <td className='td-action'> 
                                        <DeleteForeverIcon 
                                            className="icon" 
                                            onClick={() => { onDeleteResultClick(r); }}
                                        ></ DeleteForeverIcon>
                                    </td>
                                </tr>
                            )
                        })}
                        <tr></tr>
                        <tr className='input-row'>
                            <td></td>
                            {inputRowCells}
                        </tr>
                    </tbody>
                </table>

                <div className="actions-container">
                    <FormButton onClick={() => { }} text="Назад к списку"></FormButton>
                    <FormButton onClick={onSubmitClick} text="Записать результат"></FormButton>
                </div>
            </div>
        </>
    )
}

export default EditResults;