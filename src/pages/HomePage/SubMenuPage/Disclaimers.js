import React, { Component } from 'react';
import {Text, ScrollView } from 'react-native'
import UINavBar from '../../../components/UINavBar';
import { scaleSize } from '../../../global/utils';

export default class Disclaimers extends Component {
	constructor(props) {
		super(props)
		this.state = {
			
		}
	}


	render() {
		return <>
            <UINavBar title="免责声明"/>
            <ScrollView style={{padding: scaleSize(10)}}>
				<Text style={{fontSize: scaleSize(16)}}>&emsp;&emsp;鉴于有机会参加这次比赛及其相关活动（以下简称比赛），有机会争取，本人（若是未成年人，则为该未成年人的父母或监护人）以自己的名义（或代表该未成年人）并以本人的后继者、继承人、受让人、执行人、经理人、配偶和最近的亲属的名义声明如下：</Text>
				<Text style={styles.textStyle}>&emsp;&emsp;1、承认本人（我们）完全明白本人或该未成年人参加比赛存在的受伤或死亡的风险（包括经济损失及其相关损失的风险），前述风险既可能因本人或该未成年人自己的行为、不行为或疏忽、或身体或车辆因素而造成，也可能因他人的行为、不行为或疏忽、或身体或车辆因素而造成，或者因对有关器材、设施、赛道或场区的状况条件不熟悉以及这类比赛或活动的规则造成。</Text>
				<Text style={styles.textStyle}>&emsp;&emsp;2、承担本人或该未成年人人身伤害（包括一切医疗费用或住院费用）、永久丧失能力或部分丧失能力、死亡及本人财产损坏和损失方面、本人或该未成年人参加活动所导致的或由于前述参赛而产生的任何和所有风险。</Text>
				<Text style={styles.textStyle}>&emsp;&emsp;3、承诺不会就人身伤害、财产损失或死亡向比赛组织单位、个人提起关于因本人或该未成年人参加比赛而导致的损害赔偿的诉讼或提出有关索赔。</Text>
				<Text style={styles.textStyle}>&emsp;&emsp;4、承诺对于因本人或该未成年人参加比赛或活动而造成的或源自其参加比赛的任何责任、损失、损害、索赔、要求或其他诉因（不论是因后述各方的疏忽还是其他原因而造成的），放弃、免除、解除、撤销比赛所有组织者、赞助单位、场地单位及其职员、雇员和代理人的责任。</Text>
				<Text style={styles.textStyle}>&emsp;&emsp;5、同意凡是本人或该未成年人参加比赛有关的本人或该未成年人的所有照片、图片、影片、录像片和影音片，永远归比赛组织单位所有，并同意组织单位使用、授权使用前述资料。</Text>
				<Text style={styles.textStyle}>&emsp;&emsp;6、承诺永远授权比赛组织单位及其继承受让单位使用本人或该未成年人于比赛的姓名、个人信息、肖像、声音和外貌，其使用包括并不限于任何市场活动、任何商业用途、任何媒体、任何成品及其相关广告品。</Text>
				<Text style={styles.textStyle}>&emsp;&emsp;本人保证有权做出上述声明，并且不因此项放弃而损及第三者利益。</Text>
				<Text style={[styles.textStyle,{marginBottom: scaleSize(50)}]}>&emsp;&emsp;本人保证已完全阅读、理解并同意上述须知及申明条款</Text>
            </ScrollView>
        </>
	}
}

var styles = {
	textStyle: {
		marginTop: scaleSize(10),
		fontSize: scaleSize(16),
	}
}
