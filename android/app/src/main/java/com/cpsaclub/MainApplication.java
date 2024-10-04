package com.cpsaclub;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.microsoft.codepush.react.CodePush;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

import cn.jiguang.plugins.push.JPushModule;
import cn.jiguang.imui.messagelist.ReactIMUIPackage;
import io.jchat.android.JMessageReactPackage;

import com.theweflex.react.WeChatPackage;
import com.microsoft.codepush.react.CodePush;

public class MainApplication extends Application implements ReactApplication {

    private static final boolean SHUTDOWN_TOAST = false;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            @SuppressWarnings("UnnecessaryLocalVariable")
            List<ReactPackage> packages = new PackageList(this).getPackages();

            // Packages that cannot be autolinked yet can be added manually here

            // 极光IM。如果设置为 true，则不弹出 toast。
            packages.add(new JMessageReactPackage(SHUTDOWN_TOAST));
            packages.add(new WeChatPackage());
            packages.add(new ReactIMUIPackage());
            
            for(ReactPackage rp:packages){
                if(rp instanceof CodePush){
                    packages.remove(rp);
                    break;
                }
            }

            // packages.add(new CodePush(BuildConfig.CODEPUSH_KEY, getApplicationContext(), BuildConfig.DEBUG,getResources().getString(R.string.reactNativeCodePush_androidServerURL)));
            packages.add(new CodePush(getResources().getString(R.string.CodePushDeploymentKey), getApplicationContext(), BuildConfig.DEBUG));
                return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
         @Override
          protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
          }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        initializeFlipper(this); // Remove this line if you don't want Flipper enabled

        // 调用此方法：点击通知让应用从后台切到前台
        JPushModule.registerActivityLifecycle(this);
    }

    /**
     * Loads Flipper in React Native templates.
     *
     * @param context
     */
    private static void initializeFlipper(Context context) {
        if (BuildConfig.DEBUG) {
            try {
                /*
                 * We use reflection here to pick up the class that initializes Flipper, since
                 * Flipper library is not available in release mode
                 */
                Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
                aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }
}
