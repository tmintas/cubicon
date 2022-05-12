import { useEffect, useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useParams } from 'react-router-dom';
import { Contest } from '../models/state';
import './EditResults.scss';
import Button from './shared/FormButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormButton from './shared/FormButton';

type Result = {
    id: number | null,

    // TODO make id instead of string
    performedBy: string | null,
    attempt1: string | null,
    attempt2: string | null,
    attempt3: string | null,
    attempt4: string | null,
    attempt5: string | null,
    isEditing: boolean,
}

type ResultsFormState = {
    loaded: boolean,

    // contest info loaded from backend
    contest: Contest | null,

    selectedRoundId: number | null,
    selectedRoundResults: Result[],
    editingResult: Result,
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
        isValid: false,
        isEditing: false,
    };

    const [ state, setState ] = useState<ResultsFormState>({
        loaded: false,
        contest: null,
        selectedRoundId: null,
        selectedRoundResults: [],
        editingResult: defaultEditingResult,
    });

    const contestIdNumber =  Number(contestId);
    const editingResult = state.editingResult;

    useEffect(() => {
        if (contestIdNumber > 0) {
            fetch(`http://localhost:3000/contests/${contestIdNumber}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            })
                .then(r => r.json())
                .then(res => {
                    setState({
                        loaded: true,
                        contest: res,
                        selectedRoundId: res.rounds[0].id,
                        // TODO load results from backend
                        selectedRoundResults: [{
                            id: 1,
                            performedBy: 'Тимур Фролов',
                            attempt1: '14.22',
                            attempt2: '15.22',
                            attempt3: '9.77',
                            attempt4: '15.66',
                            attempt5: '11.61',
                            isEditing: false,
                        }],
                        editingResult: defaultEditingResult,
                    });
                });
        }
    }, []);

    const onRoundSelect = (roundId: number) => {
        setState(state => {
            return {
                ...state,
                selectedRoundId: roundId,
            };
        });
    }

    const onAddResultClick = () => {
        setState(state => {
            const editingResult = {
                ...state.editingResult,
                id: state.selectedRoundResults.length,
            };

            return {
                ...state,
                editingResult: defaultEditingResult,
                selectedRoundResults: [...state.selectedRoundResults, editingResult]
            }
        });
    }

    const onClearResultClick = () => {
        setState(state => {
            return {
                ...state,
                editingResult: defaultEditingResult,
                selectedRoundResults: [...state.selectedRoundResults].map(r => {
                    r.isEditing = false;
                    return r;
                }),
            }
        })
    }

    const onSubmitEditResultClick = () => {
        setState(state => {
            const editingResult = state.editingResult;

            return {
                ...state,
                editingResult: defaultEditingResult,
                selectedRoundResults: [...state.selectedRoundResults.map(r => {
                    if (!r.isEditing) {
                        return r;
                    } else {
                        r = editingResult;
                        r.isEditing = false;
                        return r;
                    }
                })]
            }
        })
    }

    const onAttemptChange = (attemptNumber: number, event: any) => {
        const attemptRawInput = event.target.value;
        const attemptKey = `attempt${attemptNumber}`;
        console.log(state.editingResult);
        
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

    const onDeleteResultClick = (result: Result) => {
        setState((state) => {
            return {
                ...state,
                selectedRoundResults: state.selectedRoundResults.filter(r => r.performedBy !== result.performedBy),
                editingResult: defaultEditingResult,
            };
        });
    }

    const onEditResultClick = (result: Result) => {
        setState((state) => {
            return {
                ...state,
                editingResult: result,
                selectedRoundResults: [...state.selectedRoundResults].map(r => {
                    if (r.performedBy === result.performedBy) {
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
        state.selectedRoundResults.every(r => r.isEditing || r.performedBy !== state.editingResult.performedBy);

    const newResultIsCleared = !editingResult.attempt1 && !editingResult.attempt2 && !editingResult.attempt3 && 
        !editingResult.attempt4 && !editingResult.attempt5 && !editingResult.performedBy;

    const inputRowCells = !state.editingResult ? <div>empty</div> :
        <>
            <td>
                <input
                    type="text"
                    value={state.editingResult.performedBy ?? ''}
                    onChange={(e) => { onNameChange(e); }}
                />
            </td>
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
                    !!state.editingResult.id
                        ? <button className='inline-button' disabled={!isEditingResultValid} onClick={onSubmitEditResultClick}>
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
                                onClick={() => onRoundSelect(r.id)}>
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
                            <th style={{width: '5%'}}>Место</th>
                            <th style={{width: '35%'}}>Участник</th>
                            <th style={{width: '50%'}} colSpan={5}>Сборки</th>
                            <th ></th>
                        </tr>
                    </thead>

                    <tbody>
                        {state.selectedRoundResults.map((r, i) => {
                            return (
                                // TODO use id
                                <tr key={i}>
                                    <td className='td-order'>{i}</td>
                                    <td className='td-name'>{r.performedBy}</td>
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
                    <FormButton onClick={() => { }} text="Записать результат"></FormButton>
                </div>
            </div>
        </>
    )
}

export default EditResults;