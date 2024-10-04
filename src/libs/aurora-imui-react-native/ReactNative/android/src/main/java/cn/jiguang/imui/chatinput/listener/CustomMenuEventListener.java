package cn.jiguang.imui.chatinput.listener;


import cn.jiguang.imui.chatinput.menu.view.MenuFeature;
import cn.jiguang.imui.chatinput.menu.view.MenuItem;

/**
 * Custom Menu' callbacks
 */
public interface CustomMenuEventListener {

    boolean onMenuItemClick(String tag, MenuItem menuItem);

    void onMenuFeatureVisibilityChanged(int visibility, String tag, MenuFeature menuFeature);

}