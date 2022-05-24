import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Contest } from "../models/state";
import './ContestsList.scss';
import EditIcon from '@mui/icons-material/Edit';
import BallotIcon from '@mui/icons-material/Ballot';
import FormButton from './shared/FormButton';
import CampaignIcon from '@mui/icons-material/Campaign';

type ContestsListState = {
    isLoaded: boolean,
    allContests: Contest[],
    showUpcoming: boolean,
}

const ContestList = () => {
    const monthsAbbreviations = [ 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ];
    const [ state, setState ] = useState<ContestsListState>({ 
        isLoaded: false,
        allContests: [], 
        showUpcoming: true 
    });

    const navigate = useNavigate();

    const onEditContestClick = (event: any, contestId: number) => {
        event.stopPropagation();

        navigate(`./${contestId}/edit`);
    }

    const onContestItemClick = (event: any, contestId: number) => {
        event.stopPropagation();
        
        navigate(`./${contestId}/results`);
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
                })
            });
    }, [])  

    // filters contests that should be displayed
    const filterContests = (contests: Contest[], showUpcoming: boolean) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return contests.filter(c => {
            return showUpcoming ? c.date >= today && !c.isPublished : c.isPublished;
        });
    }

    // stringifies the date object into a human readable format
    const getReadableDate = (date: Date) => {
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
    const toggleContestTab = (showUpcoming: boolean) => {
        setState(state => {
            return {
                ...state,
                showUpcoming,
            };
        });
    }

    const publishContest = async (event: any, contestId: number) => {
        event.stopPropagation();

        const contest = state.allContests.find(c => c.id === contestId);
        
        if (!contest) {
            throw new Error(`Контест с id = ${contestId} не найден.`);
        }

        const response = await fetch(`http://localhost:3000/contests/${contestId}/publish`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
        });

        // TODO add error handling
        if (!response.ok) {
            throw new Error('Ошибка при сохранении контеста.')
        }

        setState(state => {
            return {
                ...state,
                allContests: state.allContests.map(c => {
                    if (c.id !== contestId) return c;

                    c.isPublished = true;
                    return c;
                })
            }
        });
    }

    const onEditContestResultsClick = (event: any, contestId: number) => {
        event.stopPropagation();

        navigate(`./${contestId}/edit-results`);
    }

    const getContestItem = (c: Contest) => {
        return (
            <div className="list-item" key={c.id} onClick={(e) => onContestItemClick(e, c.id) }>
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
                            <CampaignIcon className="action-icon" onClick={(e) => publishContest(e, c.id) } ></CampaignIcon>
                            <BallotIcon className="action-icon" onClick={(e) => { onEditContestResultsClick(e, c.id); }}></BallotIcon>
                            <EditIcon className="action-icon" onClick={(e) => { onEditContestClick(e, c.id); }}></EditIcon>
                            <DeleteForeverIcon className="action-icon" onClick={() => { onDeleteClick(c.id); }}></ DeleteForeverIcon>
                        </>
                    }
                </div>
            </div>
        );
    }

    const displayedContests = filterContests(state.allContests, state.showUpcoming);

    return (
        <>
            <div className="tabs">
                <h2 className={state.showUpcoming ? 'active' : ''} onClick={() => { toggleContestTab(true) } }>Предстоящие</h2>
                <h2 className={state.showUpcoming ? '' : 'active'} onClick={() => { toggleContestTab(false) } }>Прошедшие</h2>
            </div>

            <div className="list-container">
                {
                    !displayedContests.length 
                        ? <div style={{ 'padding': '20px' }}>
                            Нет {state.showUpcoming ? ' предстоящих' : 'прошедших'} контестов
                        </div>
                        : displayedContests.map(c =>  getContestItem(c))
                }
            </div>

            <div className="actions-container">
                <FormButton onClick={() => { navigate('./0/edit')}} disabled={false} text="Создать контест"></FormButton>
            </div>
        </>
    )
}

export default ContestList;
