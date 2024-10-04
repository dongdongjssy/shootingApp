import Axios from "axios";
import querystring from "query-string";
import { UserStore } from '../store/UserStore';
import { Toast } from 'teaset';
import { RouteHelper } from 'react-navigation-easy-helper'

let axios = Axios.create({
    timeout: 5000,
    headers: { "Content-Type": "application/json" }
});

//请求拦截处理
axios.interceptors.request.use(
    async config => {
        let user = await UserStore.getLoginUser();
        if (user) {
            // console.log("user",user);
            config.headers.Authorization = "Bearer " + user.token;
            config.headers.userId = user.id;
        }

        // if (user.clubId) {
        //     config.headers.clubId = user.clubId;
        // }

        return config;
    },
    error => {
        console.log("error=" + JSON.stringify(error));
        return Promise.reject(error);
    }
);

// respone拦截器
axios.interceptors.response.use(
    response => {
        return response
    },
    error => {
        // console.log("error=" + JSON.stringify(error));
        return Promise.reject(error);
    }
);

export default class http {

    // GET
    static async get(url, params) {
        try {
            let res = null;

            if (!params) {
                res = await axios.get(url);
            } else {
                let query = querystring.stringify(params);
                res = await axios.get(url + "?" + query);
            }

            return res
        } catch (error) {
            this.handleError(error);
            return error;
        }
    }

    // POST
    static async post(url, params) {
        if (url) {
            try {
                let res = await axios.post(url, params);
                if (res.status == 200 && res.data && res.data.code && res.data.msg && res.data.data) {
                    if (res.data.code >= 400 && res.data.code < 500) {
                        throw { "code": res.data.code, "msg": res.data.msg, "description": res.data.data, "config": res.config } //avoid using data in error
                    }
                }
                return res;
            } catch (error) {
                this.handleError(error);
                return error;
            }
        }
    }

    // PUT
    static async put(url, params) {
        try {
            let res = await axios.put(url, params);
            return res;
        } catch (error) {
            this.handleError(error);
            return error;
        }
    }

    // DELETE
    static async delete(url, params) {
        /**
         * params默认为数组
         */
        try {
            let res = await axios.post(url, params);
            return res;
        } catch (error) {
            this.handleError(error);
            return error;
        }
    }

    static handleError(error) {
        const status = error.name;
        const message = error.message;
        const code = error.code;
        console.debug("[API Call ERROR]: " + JSON.stringify(error));

        if (error.stack && message) {
            if (code) {
                switch (code) {
                    case "ECONNABORTED":
                        Toast.message(I18n.t("api_error_network_timeout"));   //"timeout of 10000ms exceeded"
                        break;
                    default:
                }
            }
            else {
                //Uncaught exception on server side, "Request failed with status code 500"
                if (message.endsWith("code 500")) {
                    Toast.message(I18n.t("服务器连接出错"));
                }
                else if (message.endsWith("code 404")) {
                    Toast.message("服务器连接出错");
                }
                else {
                    Toast.message(message);
                }
            }
            // console.log(error.config.url + " " + error.config.data); //turn on for debug
            return
        }
        else if (code == 401) {
            Toast.message("登录过期，请重新登录")
            UserStore.cleanLoginUser()
            RouteHelper.reset("LoginPage")
            return
        }
        else if (status === 403) {
            //router.push("/Exception/403");
            return;
        } else if (message === "Network Error") {
            // router.push("/Exception/500");
            return;
        } else if (status >= 404 && status < 422) {
            //router.push("/404");
        } else {
            return error;
        }
    }
}
