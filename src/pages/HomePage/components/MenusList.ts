import ApiUrl from '../../../api/Url.js';
const menusList =  
[
    {
        routePath: "CommonActivityListPage",
        params: {
            pageText: "认证/培训",
            fkTableId: 1,
            restApiUrl: ApiUrl.TRAINING_LIST,
            imagePath: ApiUrl.TRAINING_IMAGE,
            carouselOnPage: 2,
        },
        title: "培训",
    },
    {
        routePath: "CommonActivityListPage",
        params: {
            pageText: "国内/际赛事",
            fkTableId: 2,
            restApiUrl: ApiUrl.CONTEST_LIST,
            imagePath: ApiUrl.CONTEST_IMAGE,
            carouselOnPage: 3
        },
        title: "赛事",
    },
    {
        routePath: "RankPage",
        params: {},
        title: "成绩",
    }
]  

export default menusList;