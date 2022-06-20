import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Contest, ContestStatus } from "../models/state";
import './ContestsList.scss';
import EditIcon from '@mui/icons-material/Edit';
import FormButton from './shared/FormButton';
import CampaignIcon from '@mui/icons-material/Campaign';

type ContestsListState = {
    isLoaded: boolean,
    allContests: Contest[],
    showUpcoming: boolean,
}

const ContestList = () => {
    const monthsAbbreviations = [ 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ];
    
    const navigate = useNavigate();
    const [ params ] = useSearchParams();
    const { search } = useLocation();

    const isAdmin: boolean = params.get('isAdmin') === 'true';
    const showUpcoming: boolean = params.get('showUpcoming') === 'true';

    const [ state, setState ] = useState<ContestsListState>({ 
        isLoaded: false,
        allContests: [],
        showUpcoming,
    });

    // initial loading of contests
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_SERVER_URL}/contests`)
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

    const onEditContestClick = (event: any, contestId: number) => {
        event.stopPropagation();

        navigate(`./${contestId}/edit${search}`);
    }

    // TODO refactor navigation - move showUpcoming, isAdmin to the redux state
    const onContestItemClick = (event: any, contest: Contest) => {
        event.stopPropagation();
       
        const pageUrl = isAdmin && contest.status !== ContestStatus.PUBLISHED
            ? 'edit-results'
            : 'results';

        navigate(`./${contest.id}/${pageUrl}${search}`);
    }

    const onDeleteClick = async (contestId: number) => {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER_URL}/contests/${contestId}`, {
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

    const toggleContestTab = (showUpcoming: boolean) => {
        // TODO ad helper methods to construct query params from an object
        navigate({
            search: `?showUpcoming=${showUpcoming}${isAdmin ? '&isAdmin=true' : ''}`
        });

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

        const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER_URL}/contests/${contestId}/publish`, {
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

                    c.status = ContestStatus.PUBLISHED;
                    return c;
                })
            }
        });
    }

    const getActions = (c: Contest) => {
        if (c.status === ContestStatus.PUBLISHED || !isAdmin) return null;

        return (
            <>
                <button className='action-button' disabled={c.status === ContestStatus.NEW} onClick={(e) => publishContest(e, c.id) }>  
                    <CampaignIcon 
                        className="action-icon" 
                    >
                    </CampaignIcon>
                </button>

                <button className='action-button'>
                    <EditIcon className="action-icon" onClick={(e) => { onEditContestClick(e, c.id); }}></EditIcon>
                </button>

                <button className='action-button'>
                    <DeleteForeverIcon className="action-icon" onClick={() => { onDeleteClick(c.id); }}></ DeleteForeverIcon>
                </button>
            </>
        );
    }

    const getMainInfo = (c: Contest) => {
        return (
            <>
                <p>{c.name}</p>
                <p>{getReadableDate(new Date(c.date))}</p>
                {c.city ? <p>{c.city}</p> : null}
                {c.organizedBy ? <p>{c.organizedBy.firstName + ' ' + c.organizedBy.lastName}</p> : null}
            </>
        );
    }

    const getContestItem = (c: Contest) => {
        return (
            <div className="list-item" key={c.id} onClick={(e) => onContestItemClick(e, c) }>
                <div className="actions-menu actions-menu-left">
                </div>
                <div className="contest-preview" key={c.name}>
                    <div className="main-info">
                        {getMainInfo(c)}
                    </div>
                    <hr />
                    <div className="additional-info">
                        {getEventItems(c)}
                    </div>
                </div>
                <div className="actions-menu actions-menu-right">
                    { getActions(c) }
                </div>
            </div>
        );
    }

    const validStatuses = state.showUpcoming 
        ? [ContestStatus.NEW, ContestStatus.EDITING_RESULTS] 
        : [ContestStatus.PUBLISHED];

    const displayedContests = state.allContests.filter(c => validStatuses.some(s => c.status === s));

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

            {
                isAdmin &&
                <div className="actions-container">
                    <FormButton onClick={() => { navigate(`./0/edit${search}`)}} disabled={false} text="Создать контест"></FormButton>
                </div>
            }
        </>
    )
}

export default ContestList;
