import "./public-path";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import { routes } from "./router";
import store from "@/store";
import "@/filter";
import "@/shared/initLazyLoad";

import "@/shared/registAntd";

const packageName = require("../package.json").name;

Vue.config.productionTip = false;

let router = null;
let instance = null;

/**
 * 自定义render 方法，主要是处理router 和 组件实例
 * router 子应用需要有公共base路径用于基座项目的路由匹配，这里会重写router
 */
function VueRender(props = {}) {
  const { container } = props;
  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? `/${packageName}` : "",
    mode: "history",
    routes
  });

  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount(container ? container.querySelector("#app") : "#app");
}

/*如果不作为微应用加载则直接调用VueRender*/
if (!window.__POWERED_BY_QIANKUN__) {
  VueRender();
}

/*
 * 微应用必须暴露加载的生命周期hooks
 *
 * */
export async function bootstrap() {
  console.log("[vue] vue app bootstraped");
}

/*监听全局状态变化
 * onGlobalStateChange: (callback: OnGlobalStateChangeCallback, fireImmediately?: boolean) => void， 在当前应用监听全局状态，有变更触发 callback，fireImmediately = true 立即触发 callback
 *
 * callback(state,prev)
 * @params {Object} state //变更后的全局状态对象
 * @params {Object} prev  //变更前的全局状态对象
 *
 * 这里用export暴露给子组件调用，下同
 * */
export let onGlobalStateChange;

/*改变全局状态
 * setGlobalState: (state: Record<string, any>) => boolean， 按一级属性设置全局状态，微应用中只能修改已存在的一级属性
 * */
export let setGlobalState;

export async function mount(props) {
  onGlobalStateChange = props.onGlobalStateChange;
  setGlobalState = props.setGlobalState;

  console.log("[vue] props from main framework", props);
  VueRender(props)
}

export async function unmount() {
  instance.$destroy();
  instance = null;
  router = null;
}
