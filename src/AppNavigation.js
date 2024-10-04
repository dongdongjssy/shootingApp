import {
  Animated,
  Easing
} from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { configRoute } from 'react-navigation-easy-helper';
import StartPage from './pages/StartPage'; //判断页面；
import GuidePage from './pages/GuidePage/index'; //引导页；
import MainPage from './pages/MainPage';
import LoginPage from './pages/RegLogin/LoginPage';
import SearchPage from './pages/HomePage/SearchPage';
import SearchListPage from './pages/HomePage/SearchListPage';
import DynamicDetailPage from './pages/HomePage/DynamicDetailPage';
import DynamicAddPage from './pages/HomePage/DynamicAddPage';

import CommonActivityListPage from './pages/HomePage/SubMenuPage/CommonActivityListPage';
import CommonActivityDetailPage from './pages/HomePage/SubMenuPage/CommonActivityDetailPage';
import RegisterPage from './pages/HomePage/SubMenuPage/RegisterPage';
import RegisterSuccessPage from './pages/HomePage/SubMenuPage/RegisterSuccessPage';

import CoachJudgePage from './pages/HomePage/CoachJudgePage';
import RankPage from './pages/HomePage/RankPage';
import RankDetailPage from './pages/HomePage/RankDetailPage';
import MatchRankListPage from './pages/HomePage/MatchRankListPage';
import ImageZoomView from './pages/common/ImageZoomView';

import ClubListPage from './pages/ClubPage/ClubListPage';
import ClubDetailPage from './pages/ClubPage/ClubDetailPage';

import TakePicAndRecordVideoPage from './pages/common/TakePicAndRecordVideoPage';

import ActivityListPage from './pages/ClubPage/ActivityListPage';
import ActivityDetailPage from './pages/ClubPage/ActivityDetailPage';

import MsgPage from './pages/MsgPage/index';
import SearchFriendPage from './pages/MsgPage/SearchFriendPage';
import FriendRequestPage from './pages/MsgPage/FriendRequestPage';
import ContactsPage from './pages/MsgPage/ContactsPage';
import ChatPage from './pages/MsgPage/ChatPage';
import NotificationsPage from './pages/MsgPage/NotificationsPage';
import SysytemNotificationDetailPage from './pages/MsgPage/SysytemNotificationDetailPage';

//我的
import AuthenticationPage from './pages/MyPage/AuthenticationPage';
import MyFansPage from './pages/MyPage/MyFansPage';
import MyFollowPage from './pages/MyPage/MyFollowPage';
import MyClubPage from './pages/MyPage/MyClubPage';
import UserCenterPage from './pages/MyPage/UserCenterPage';
import EditInfoPage from './pages/MyPage/EditInfoPage';
import MyActivityPage from './pages/MyPage/MyActivityPage';
import MyCollectPage from './pages/MyPage/MyCollectPage';
import AboutPage from './pages/MyPage/AboutPage';
import BelongClubPage from './pages/MyPage/BelongClubPage';
import MyPointPage from './pages/MyPage/MyPointPage';
import ContactKefu from './pages/MyPage/ContactKefu';
import CanvassBusinessPage from './pages/MyPage/CanvassBusinessPage';
import Help from './pages/MyPage/Help';
import PrivacyPolicyPage from './pages/MyPage/PrivacyPolicyPage';
import ServiceAggreementPage from './pages/MyPage/ServiceAggreementPage';
import ContactAssociation from './pages/MyPage/ContactAssociation';
import AboutUsPage from './pages/MyPage/AboutUsPage';
import UpdatePassword from './pages/MyPage/UpdatePassword';
import EditPassword from './pages/MyPage/EditPassword';
import UserIntroductionPage from './pages/MyPage/UserIntroductionPage';
import PaymentPage from './pages/ClubPage/PaymentPage';//我的赛事、培训支付页面
import RegisterPageDetail from './pages/MyPage/RegisterPageDetail';
import TrainingIntentionPage from './pages/MyPage/TrainingIntentionPage';
import MyRolesPage from './pages/MyPage/MyRolesPage';
import HonorPage from './pages/MyPage/HonorPage';
import MyIntegralCardPage from './pages/MyPage/MyIntegralCardPage';
import MyIntegralListPage from './pages/MyPage/MyIntegralListPage';
import IntegralRulePage from './pages/MyPage/integralRulePage';

//公共页面;
import WebViewPage from './pages/common/WebViewPage';
import CameraRollPage from './pages/common/CameraRollPage';
import AlbumsCatePage from './pages/common/CameraRollPage/AlbumsCatePage';
import BigImageShowPage from './pages/common/BigImageShowPage';
import VideoShowPage from './pages/common/VideoShowPage';
import HtmlViewPage from './pages/common/HtmlViewPage';
import ReportPage from './pages/common/ReportPage';
import ReportSuccessPage from './pages/common/ReportSuccessPage';
import GroupMemberList from './pages/MsgPage/GroupMemberList';

//广告页
import Advertisement from './pages/Advertisement';

//成绩规则说明
import RankRulePage from './pages/HomePage/rankRulePage';

import Disclaimers from './pages/HomePage/SubMenuPage/Disclaimers';

//商城
import GoodsDetailPage from './pages/ShoppingPage/goodsDetailPage';
import GoodsBannerDetailPage from './pages/ShoppingPage/goodsBannerDetailPage';
import ShoppingCarPage from './pages/ShoppingPage/shoppingCarPage';
import ReceivingAddressPage from './pages/ShoppingPage/receivingAddressPage';
import AddReceivingAddressPage from './pages/ShoppingPage/addReceivingAddressPage';
import DownOrderPage from './pages/ShoppingPage/downOrderPage';
import EvaListPage from './pages/ShoppingPage/evaListPage';
import InvoicePage from './pages/ShoppingPage/invoicePage';
import AddInvoicePage from './pages/ShoppingPage/addInvoicePage';
import AddOrderPage from './pages/ShoppingPage/addOrderPage';
import PaymentEndPage from './pages/ShoppingPage/paymentEndPage';
import OrderDetailPage from './pages/ShoppingPage/orderDetailPage';
import AddEvaPage from './pages/ShoppingPage/addEvaPage';
import OrderPage from './pages/ShoppingPage/orderPage';


export const createNavigation = function (props) {
  return createAppContainer(
    createStackNavigator(
      configRoute({
        ReportPage: { screen: ReportPage },
        ReportSuccessPage: { screen: ReportSuccessPage },
        StartPage: { screen: StartPage }, //开始页面，用来判断用户状态；
        GuidePage: { screen: GuidePage }, //引导页；
        LoginPage: { screen: LoginPage }, //登录页面，
        MainPage: { screen: MainPage }, //主页；
        SearchPage: { screen: SearchPage },
        SearchListPage: { screen: SearchListPage },
        DynamicDetailPage: { screen: DynamicDetailPage },
        DynamicAddPage: { screen: DynamicAddPage },
        BigImageShowPage: { screen: BigImageShowPage },

        CommonActivityListPage: { screen: CommonActivityListPage },
        CommonActivityDetailPage: { screen: CommonActivityDetailPage },
        RegisterPage: { screen: RegisterPage },
        RegisterSuccessPage: { screen: RegisterSuccessPage },

        CoachJudgePage: { screen: CoachJudgePage },

        //积分成绩排名
        RankPage: { screen: RankPage },
        RankDetailPage: { screen: RankDetailPage },
        TakePicAndRecordVideoPage: { screen: TakePicAndRecordVideoPage },
        //赛事页进成绩列表
        MatchRankListPage: { screen: MatchRankListPage },
        ImageZoomView: { screen: ImageZoomView },

        //俱乐部
        ClubListPage: { screen: ClubListPage },
        ClubDetailPage: { screen: ClubDetailPage },

        ActivityDetailPage: { screen: ActivityDetailPage },
        ActivityListPage: { screen: ActivityListPage },

        //消息;
        MsgPage: { screen: MsgPage },
        SearchFriendPage: { screen: SearchFriendPage },
        FriendRequestPage: { screen: FriendRequestPage },
        ContactsPage: { screen: ContactsPage },
        ChatPage: { screen: ChatPage },
        NotificationsPage: { screen: NotificationsPage },
        SysytemNotificationDetailPage: { screen: SysytemNotificationDetailPage },
        GroupMemberList: { screen: GroupMemberList },

        //我的
        AuthenticationPage: { screen: AuthenticationPage },
        MyFansPage: { screen: MyFansPage },
        MyFollowPage: { screen: MyFollowPage },
        MyClubPage: { screen: MyClubPage },
        UserCenterPage: { screen: UserCenterPage },
        EditInfoPage: { screen: EditInfoPage },
        MyActivityPage: { screen: MyActivityPage },
        MyCollectPage: { screen: MyCollectPage }, //
        AboutPage: { screen: AboutPage }, //
        BelongClubPage: { screen: BelongClubPage },
        MyPointPage: { screen: MyPointPage }, //我的积分；
        ContactKefu: { screen: ContactKefu }, //我的积分；
        CanvassBusinessPage: { screen: CanvassBusinessPage },
        Help: { screen: Help },
        ServiceAggreement: { screen: ServiceAggreementPage },
        PrivacyPolicy: { screen: PrivacyPolicyPage },
        ContactAssociation: { screen: ContactAssociation },
        AboutUs: { screen: AboutUsPage },
        UpdatePassword: { screen: UpdatePassword },
        EditPassword: {screen: EditPassword},
        UserIntroductionPage:{screen:UserIntroductionPage},
        PaymentPage: {screen: PaymentPage},
        RegisterPageDetail: {screen: RegisterPageDetail},
        TrainingIntentionPage:{screen:TrainingIntentionPage},
        MyRolesPage: {screen: MyRolesPage},
        HonorPage: {screen: HonorPage},
        MyIntegralCardPage: {screen: MyIntegralCardPage},
        MyIntegralListPage: {screen: MyIntegralListPage},
        IntegralRulePage: {screen: IntegralRulePage},
        //公共页面；
        WebViewPage: { screen: WebViewPage }, //
        CameraRollPage: { screen: CameraRollPage }, //
        AlbumsCatePage: { screen: AlbumsCatePage },
        VideoShowPage: { screen: VideoShowPage },
        HtmlViewPage: { screen: HtmlViewPage },

        //广告页
        Advertisement: { screen: Advertisement },
        RankRulePage: { screen: RankRulePage },

        Disclaimers: {screen: Disclaimers},

        //商城
        GoodsDetailPage: {screen: GoodsDetailPage},
        GoodsBannerDetailPage: {screen:GoodsBannerDetailPage},
        ShoppingCarPage: {screen: ShoppingCarPage},
        ReceivingAddressPage: {screen: ReceivingAddressPage},
        AddReceivingAddressPage: {screen: AddReceivingAddressPage},
        DownOrderPage: {screen: DownOrderPage},
        EvaListPage: {screen: EvaListPage},
        InvoicePage: {screen: InvoicePage},
        AddInvoicePage: {screen: AddInvoicePage},
        AddOrderPage:{screen: AddOrderPage},
        PaymentEndPage:{screen:PaymentEndPage},
        OrderDetailPage:{screen:OrderDetailPage},
        AddEvaPage:{screen:AddEvaPage},
        OrderPage:{screen:OrderPage},
      }),
      {
        initialRouteName: 'StartPage',
        initialRouteParams: props,
        defaultNavigationOptions: {
          header: null,
          gesturesEnabled: false,
        },
        transitionConfig: () => ({
          transitionSpec: {
            // duration: 100,
            // easing: Easing.out(Easing.poly(4)),
            // timing: Animated.timing,
            // isInteraction: false
          },
          /*screenInterpolator: sceneProps => {
            const {layout, position, scene} = sceneProps;
            const {index} = scene;
            const Width = layout.initWidth;
            //沿X轴平移
            const translateX = position.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [Width, 0, -(Width - 10)],
            });
            //透明度
            const opacity = position.interpolate({
              inputRange: [index - 1, index - 0.99, index],
              outputRange: [0, 1, 1],
            });
            return {opacity, transform: [{translateX}]};
        }*/
        }),
      },
    ),
  );
};
