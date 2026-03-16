/**
 * pages.config.js - Page routing configuration
 */
import Home from './pages/Home';
import CreateList from './pages/CreateList';
import MyLists from './pages/MyLists';
import ManageList from './pages/ManageList';
import ListDetail from './pages/ListDetail';
import Explore from './pages/Explore';
import About from './pages/About';
import Success from './pages/Success';
import Auth from './pages/Auth'; 
import Settings from './pages/Settings'; 
import ResetPassword from './pages/ResetPassword'; 
// AJOUT : Import de la page de modération admin
import AdminModeration from './pages/AdminModeration';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "CreateList": CreateList,
    "MyLists": MyLists,
    "ManageList": ManageList,
    "ListDetail": ListDetail,
    "Explore": Explore,
    "About": About,
    "Success": Success,
    "Auth": Auth, 
    "Settings": Settings, 
    "ResetPassword": ResetPassword, 
    // AJOUT : Route pour l'administration
    "AdminModeration": AdminModeration,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};