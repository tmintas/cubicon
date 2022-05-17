import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Contest } from "../models/state";
import './ContestsList.scss';
import EditIcon from '@mui/icons-material/Edit';
import BallotIcon from '@mui/icons-material/Ballot';

type ContestsListState = {
    isLoaded: boolean,
    allContests: Contest[],
    displayedContests: Contest[],
    showUpcoming: boolean,
}

const ContestList = () => {
    const monthsAbbreviations = [ 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ];
    const [ state, setState ] = useState<ContestsListState>({ 
        isLoaded: false,
        allContests: [], 
        displayedContests: [], 
        showUpcoming: true 
    });

    const navigate = useNavigate();

    const onEditClick = (contestId: number) => {
        navigate(`../edit-contest/${contestId}`);
    }

    const onDeleteClick = async (contestId: number) => {
        const response = await fetch(`http://localhost:3000/contests/${contestId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        });

        // TODO add error handling
        if (!response.ok) return;

        const updatedItems = [...state.allContests].filter(c => c.id !== contestId);

        setState(state => {
            return {
                ...state,
                isLoaded: true,
                allContests: updatedItems,
                displayedContests: filterContests(updatedItems, state.showUpcoming),
            };
        });
    }

    // initial loading of contests
    useEffect(() => {
        fetch('http://localhost:3000/contests')
            .then(v => v.json())
            .then((contests) => {
                contests = contests.map((c: any) => {
                    c.date = new Date(c.date);
                    
                    return c;
                });

                setState({
                    ...state,
                    isLoaded: true,
                    allContests: contests,
                    displayedContests: filterContests(contests, state.showUpcoming),
                })
            });
    }, [])  

    // filters contests that should be displayed
    const filterContests: (contests: Contest[], showUpcoming: boolean) => Contest[] = (contests: Contest[], showUpcoming: boolean) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return contests.filter(c => {
            return showUpcoming ? c.date >= today : c.date < today;
        });
    }

    // stringifies the date object into a human readable format
    const getReadableDate: (date: Date) => string = (date: Date) => {
        return `${ monthsAbbreviations[new Date(date).getMonth()]} ${date.getDate()}, ${date.getFullYear()  }`;
    } 

    // TODO add other events besides 3x3
    const getEventItems = (contest: Contest) => {
        return (
            <div className="event-container">
                3x3
            </div>
        );
    }

    // toggles selected contest mode and updates the state
    const toggleContestTab: (showUpcoming: boolean) => void = (showUpcoming: boolean) => {
        setState(state => {
            return {
                ...state,
                showUpcoming,
                displayedContests: filterContests(state.allContests, showUpcoming),
            };
        });
    }

    const onEditContestResultsClick: (contestId: number) => void = (contestId: number) => {
        navigate(`../edit-results/${contestId}`);
    }

    return (
        <>
            <div className="tabs">
                <h2 className={state.showUpcoming ? 'active' : ''} onClick={() => { toggleContestTab(true) } }>Предстоящие</h2>
                <h2 className={state.showUpcoming ? '' : 'active'} onClick={() => { toggleContestTab(false) } }>Прошедшие</h2>
            </div>

            <div className="list-container">
                {state.displayedContests.map(c => {
                    return (
                        <div className="list-item" key={c.id}>
                            <div className="actions-menu actions-menu-left">
                            </div>
                            <div className="contest-preview" key={c.name}>
                                <div className="main-info">
                                    <p>{c.name}</p>
                                    <p>{getReadableDate(new Date(c.date))}</p>
                                    {c.city ? <p>{c.city}</p> : null}
                                    {c.organizedBy ? <p>{c.organizedBy.firstName + ' ' + c.organizedBy.lastName}</p> : null}
                                </div>
                                <hr />
                                <div className="additional-info">
                                    {getEventItems(c)}
                                </div>
                            </div>
                            <div className="actions-menu actions-menu-right">
                                {
                                    state.showUpcoming &&
                                    <>
                                        <BallotIcon className="action-icon" onClick={() => { onEditContestResultsClick(c.id); }}></BallotIcon>
                                        <EditIcon className="action-icon" onClick={() => { onEditClick(c.id); }}></EditIcon>
                                        <DeleteForeverIcon className="action-icon" onClick={() => { onDeleteClick(c.id); }}></ DeleteForeverIcon>
                                    </>
                                }
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="actions-container">
                <button onClick={() => { navigate('/edit-contest/0'); }}>Создать контест</button>
            </div>
        </>
    )
}

export default ContestList;
