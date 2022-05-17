import { useEffect, useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate, useParams } from 'react-router-dom';
import { Contest } from '../models/state';
import './EditResults.scss';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormButton from './shared/FormButton';
import { rawListeners } from 'process';

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
    performedByStr: string | null,

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
    const navigate = useNavigate();
    const { id: contestId } = useParams();
    const defaultEditingResult = {
        id: null,
        performedByStr: null,
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

    useEffect(() => {
        if (contestIdNumber > 0) {
            fetch(`http://localhost:3000/contests/${contestIdNumber}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            })
                .then(r => r.json())
                .then((contest: Contest) => {
                    const contestResults = contest.rounds.flatMap(round => round.results).map(r => {
                        const resultUIItem = {
                            id: r.id,
                            attempt1: toDelimitedString(r.attempt1),
                            attempt2: toDelimitedString(r.attempt2),
                            attempt3: toDelimitedString(r.attempt3),
                            attempt4: toDelimitedString(r.attempt4),
                            attempt5: toDelimitedString(r.attempt5),
                            best: toDelimitedString(r.best),
                            average: toDelimitedString(r.average),
                            performedByStr: r.performedByStr,
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
                });
        }
    }, []);

    // useEffect(() => {
    //     console.log('my effect');
    //     console.log('items changed:');
    //     console.log(state.contestResults);    
    //     setState((state) => {
    //         return {
    //             ...state,
    //             contestResults: state.contestResults.sort
    //         };
    //     })    
    // }, state.contestResults.map(r => r.average));

    const toDelimitedString = (resultMs: number) => {
        const minutes = Math.floor(resultMs / 6000);
        const seconds = Math.floor((resultMs - 6000 * minutes) / 100);
        const milliseconds = resultMs - 6000 * minutes - seconds * 100;

        return `${minutes > 0 ? minutes + ':' : ''}${seconds}.${milliseconds < 10 ? '0' + milliseconds : milliseconds}`;
    }

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

    // TODO add DNF, DNS
    const getBestAndAverage: (result: ResultUIItem) => [number, number] = (result: ResultUIItem) => {
        const results = [ result.attempt1, result.attempt2, result.attempt3, result.attempt4, result.attempt5 ].map(r => toMilliseconds(r));

        const best = results.reduce((prev, cur) => cur < prev ? cur : prev, results[0]);
        const withoutBest: number[] = results.filter((_, i) => i !== results.indexOf(best));
        const worst = withoutBest.reduce((prev, cur) => cur > prev ? cur : prev, withoutBest[0]);
        const withoutBestAndWorst: number[] = withoutBest.filter((_, i) => i !== withoutBest.indexOf(worst));

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
        let newResult: ResultUIItem = { 
            ...editingResult, 
            best: toDelimitedString(getBestAndAverage(editingResult)[0]),
            average: toDelimitedString(getBestAndAverage(editingResult)[1]),
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
        })
    }

    const onResultSaveClick = () => {        
        setState(state => {
            return {
                ...state,
                editingResult: defaultEditingResult,
                contestResults: [...state.contestResults.map(r => {
                    if (r.isEditing) {
                        const updatedItem: ResultUIItem = {
                            ...editingResult,
                            best: toDelimitedString(getBestAndAverage(editingResult)[0]),
                            average: toDelimitedString(getBestAndAverage(editingResult)[1]),
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

    const onNameChange = (event: any) => {
        const performedByStr = event.target.value as string;

        setState((state) => {
            return {
                ...state,
                editingResult: {
                    ...editingResult,
                    performedByStr,
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
                    if (r.performedByStr === result.performedByStr && r.roundId === state.selectedRoundId) {
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

    const onSubmitClick = async () => {
        const results = state.contestResults.map(r => {
            let result = {
                id: r.id,
                roundId: r.roundId,
                attempt1: toMilliseconds(r.attempt1),
                attempt2: toMilliseconds(r.attempt2),
                attempt3: toMilliseconds(r.attempt3),
                attempt4: toMilliseconds(r.attempt4),
                attempt5: toMilliseconds(r.attempt5),
                best: getBestAndAverage(r)[0],
                average: getBestAndAverage(r)[1],
                performedByStr: r.performedByStr,
                performedById: 3,
            };

            return result;
        });

        const res = await fetch('http://localhost:3000/results', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(results),
        });

        navigate('../contests');
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

    const contestIdNumber = Number(contestId);
    const editingResult = state.editingResult;
    const selectedRoundResults = state.contestResults
        .filter(r => r.roundId === state.selectedRoundId)
        .sort((a, b) => !!a.average && !!b.average && toMilliseconds(a.average) > toMilliseconds(b.average) ? 1 : -1);

    const isEditingResultValid = [
        editingResult.attempt1, 
        editingResult.attempt2,
        editingResult.attempt3,
        editingResult.attempt4,
        editingResult.attempt5,
    ].every(i => isAttemptInputValid(i)) && !!editingResult.performedByStr && 
        selectedRoundResults.every(r => r.performedByStr !== editingResult.performedByStr || r.isEditing);

    const newResultIsCleared = !editingResult.attempt1 && !editingResult.attempt2 && !editingResult.attempt3 && 
        !editingResult.attempt4 && !editingResult.attempt5 && !editingResult.performedByStr;

    // TSX elements
    const inputRowCells = !editingResult ? <div>empty</div> :
        <>
            <td>
                <input
                    type="text"
                    className="name-input"
                    value={state.editingResult.performedByStr ?? ''}
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
                            <th colSpan={5} style={{width: '370px'}}>Сборки</th>
                            <th colSpan={2} style={{width: '100px'}}></th>
                        </tr>
                    </thead>

                    <tbody>
                        {selectedRoundResults.map((r, i) => {
                            return (
                                // TODO use id
                                <tr key={i}>
                                    <td className='td-order'>{i+1}</td>
                                    <td className='td-name'>{r.performedByStr}</td>
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
                    <FormButton onClick={() => { navigate('../contests')}} text="Назад к списку"></FormButton>
                    <FormButton onClick={onSubmitClick} text="Записать результат"></FormButton>
                </div>
            </div>
        </>
    )
}

export default EditResults;