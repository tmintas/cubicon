import { useParams } from "react-router-dom";
import './UserProfilePage.scss';

const UserProfilePage = () => {
    const { id: userId } = useParams();

    return (
        <div className="user-profile-page">
            <div className="container main-info">
                <h2>
                    Иван Петров
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
                        <div className="info-number">12</div>
                    </div>

                    <div className="info-item">
                        <h3>
                            Всего сборок
                        </h3>
                        <div className="info-number">255</div>
                    </div>
                </div>
            </div>

            <div className="container records-info">
                <h3>Личные рекорды</h3>

                <div className="records">
                    <div className="header">
                        <p className="event"></p>
                        <p>Лучшая</p>
                        <p>Среднее</p>
                    </div>
                    <div className="header">
                        <p className="event"></p>
                        <p>Лучшая</p>
                        <p>Среднее</p>
                    </div>
                    <div className="records-row">
                        <p className="event">3x3</p>
                        <p>9.43</p>
                        <p>11.15</p>
                    </div>
                    <div className="records-row">
                        <p className="event">3x3</p>
                        <p>9.43</p>
                        <p>11.15</p>
                    </div>
                    <div className="records-row">
                        <p className="event">3x3</p>
                        <p>9.43</p>
                        <p>11.15</p>
                    </div>
                    <div className="records-row">
                        <p className="event">3x3</p>
                        <p>9.43</p>
                        <p>11.15</p>
                    </div>
                </div>
            </div>

            <div className="container results-info">
                <h3>Все результаты</h3>

                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Встреча</th>
                            <th>Раунд</th>
                            <th>Место</th>
                            <th>Лучшая</th>
                            <th>Средняя</th>
                            <th colSpan={5}>Попытки</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>Korston #1</td>
                            <td>Первый раунд</td>
                            <td>1</td>
                            <td>9.88</td>
                            <td>12.23</td>
                            <td>11.11</td>
                            <td>22.22</td>
                            <td>33.33</td>
                            <td>44.44</td>
                            <td>55.55</td>
                        </tr>
                        <tr>
                            <td>Korston #2</td>
                            <td>Первый раунд</td>
                            <td>1</td>
                            <td>9.88</td>
                            <td>12.23</td>
                            <td>11.11</td>
                            <td>22.22</td>
                            <td>33.33</td>
                            <td>44.44</td>
                            <td>55.55</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default UserProfilePage;