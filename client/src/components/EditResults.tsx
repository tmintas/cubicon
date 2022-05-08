import { useEffect, useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useParams } from 'react-router-dom';
import { Contest } from '../models/state';
import './EditResults.scss';
import Button from './shared/button';

type ResultsFormState = {
    loaded: boolean,
    contest: Contest | null,
    selectedRoundId: number | null,
}

const EditResults = () => {
    const { id: contestId } = useParams();
    const [ state, setState ] = useState<ResultsFormState>({
        loaded: false,
        contest: null,
        selectedRoundId: null,
    });

    const contestIdNumber =  Number(contestId);
    
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

    if (!state.loaded) return <div>loading...</div>;
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
                            <th >Место</th>
                            <th>Участник</th>
                            <th colSpan={5}>Сборки</th>
                            <th colSpan={2}></th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>1</td>
                            <td className='td-name'>Тимур Фролов</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-action'> 
                                <EditIcon className="icon" onClick={() => { }}></EditIcon>
                            </td>
                            <td className='td-action'> 
                                <DeleteForeverIcon className="icon" onClick={() => {  }}></ DeleteForeverIcon>
                            </td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td className='td-name'>Тимур Фролов</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-action'> 
                                <EditIcon className="icon" onClick={() => { }}></EditIcon>
                            </td>
                            <td className='td-action'> 
                                <DeleteForeverIcon className="icon" onClick={() => {  }}></ DeleteForeverIcon>
                            </td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td className='td-name'>Тимур Фролов</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-res'>11.45</td>
                            <td className='td-action'> 
                                <EditIcon className="icon" onClick={() => { }}></EditIcon>
                            </td>
                            <td className='td-action'> 
                                <DeleteForeverIcon className="icon" onClick={() => {  }}></ DeleteForeverIcon>
                            </td>
                        </tr>

                        <tr className='input-row'>
                            <td></td>
                            <td>
                                <input
                                    type="text"
                                    onChange={(e) => {}}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    onChange={(e) => {}}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    onChange={(e) => {}}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    onChange={(e) => {}}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    onChange={(e) => {}}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    onChange={(e) => {}}
                                />
                            </td>
                            <td>
                                <AddCircleIcon className='icon' fontSize='small'></AddCircleIcon>
                            </td>
                            <td>
                                <CancelIcon className='icon' fontSize='small'></CancelIcon>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="actions-container">
                    <Button onClick={() => { console.log('button click'); }} text="Назад к списку"></Button>
                    <Button onClick={() => { console.log('button click'); }} text="Записать результат"></Button>
                </div>
            </div>
        </>
    )
}

export default EditResults;