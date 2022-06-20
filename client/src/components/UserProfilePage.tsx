import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Result, User } from "../models/state";
import { toDelimitedString } from "../services/results-service";
import './UserProfilePage.scss';

type UserProfilePageState = {
    user: User | null,
    contestsCount: number,
    solvesCount: number,
    allResults: ProfileResult[],
}

type ProfileResult = Result & {
    contestId: number,
    contestName: string,
    roundName: string,
};

// TODO add records tab
// TODO add place in round value
const UserProfilePage = () => {
    const navigate = useNavigate();
    const { id: userId } = useParams();
    const [ state, setState ] = useState<UserProfilePageState>({
        user: null,
        contestsCount: 0,
        solvesCount: 0,
        allResults: [],
    });

    const baseUrl = `${process.env.REACT_APP_BACKEND_SERVER_URL}/users`;

    useEffect(() => {
        const getUser = fetch(`${baseUrl}/${userId}/profile`).then(res => res.json());
        const getContestsCount = fetch(`${baseUrl}/${userId}/contests-count`).then(res => res.json());
        const getAllResults = fetch(`${baseUrl}/${userId}/all-results`).then(res => res.json());

        Promise.all([  getUser, getContestsCount, getAllResults ])
            .then((res: [ User, number, { allResults: any[], totalSolvesCount: number }]) => {
                const user = res[0];
                const contestsCount = res[1];
                const allResultsInfo = res[2];

                setState(() => {
                    return {
                        user,
                        contestsCount,
                        solvesCount: allResultsInfo.totalSolvesCount,
                        allResults: allResultsInfo.allResults,
                    };
                })
            });
    }, []);

    const onContestClick = (contestId: number) => {
        navigate(`../contests/${contestId}/results`);
    }

    if (!state.user) return <div>Пользователь не найден!</div>;

    return (
        <div className="user-profile-page">
            <div className="container main-info">
                <h2>
                    { `${state.user.firstName} ${state.user.lastName}`}
                </h2>

                <div className="info-row">
                    <div className="info-item">
                        <h3>
                            Город
                        </h3>
                        <div className="info-text">Казань</div>
                    </div>

                    <div className="info-item">
                        <h3>
                            Посетил встреч
                        </h3>
                        <div className="info-number">{state.contestsCount}</div>
                    </div>

                    <div className="info-item">
                        <h3>
                            Всего сборок
                        </h3>
                        <div className="info-number">{state.solvesCount}</div>
                    </div>
                </div>
            </div>

            <div className="container results-info">
                <h3>Все результаты</h3>

                <table className="results-table">
                    <thead>
                        <tr>
                            <th className="th-contest">Встреча</th>
                            <th className="th-round">Раунд</th>
                            <th>Лучшая</th>
                            <th>Средняя</th>
                            <th colSpan={5}>Попытки</th>
                        </tr>
                    </thead>

                    <tbody>
                        {state.allResults.map(r => {
                            return (
                                <tr key={r.id}>
                                    <td className="td-contest" onClick={() => onContestClick(r.contestId)}>{r.contestName}</td>
                                    <td className="td-round">{r.roundName}</td>
                                    <td>{toDelimitedString(r.best)}</td>
                                    <td>{toDelimitedString(r.average)}</td>
                                    <td>{toDelimitedString(r.attempt1)}</td>
                                    <td>{toDelimitedString(r.attempt2)}</td>
                                    <td>{toDelimitedString(r.attempt3)}</td>
                                    <td>{toDelimitedString(r.attempt4)}</td>
                                    <td>{toDelimitedString(r.attempt5)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default UserProfilePage;