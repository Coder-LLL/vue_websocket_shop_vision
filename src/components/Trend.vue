<template>
	<div class="com-container">
		<div class="title" :style="comStyle">
			<span>{{ "▎ "+ showTitle}}</span>
			<span class="iconfont title-icon" :style="comStyle" @click="showChoice=!showChoice">&#xe6eb;</span>
			<div class="select-con" v-show="showChoice">
				<div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)" :style="marginStyle">
					{{item.text}}
				</div>
			</div>
		</div>
		<div class="com-chart" ref="trend_ref"></div>
	</div>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import { getThemeValue } from '../utils/theme_utils.js'
	export default {
		name: 'Trend',
		data() {
			return {
				chartInstance: null,
				allData: null,
				showChoice: false,
				choiceType: 'map',
				titleFontSize: 0
			}
		},
		computed: {
			...mapState(['theme']),
			selectTypes() {
				if (!this.allData) {
					return []
				} else {
					return this.allData.type.filter(item => {
						return item.key !== this.choiceType
					})
				}
			},
			showTitle() {
				if (!this.allData) {
					return ''
				} else {
					return this.allData[this.choiceType].title
				}
			},
			comStyle() {
				return {
					fontSize: this.titleFontSize + "px",
					color: getThemeValue(this.theme).titleColor		
				}
			},
			marginStyle() {
				return {
					marginLeft: this.titleFontSize + "px"
				}
			}
		},
		watch: {
			theme() {
				console.log("主题切换")
				// 把当前图表进行销毁
				this.chartInstance.dispose()
				// 重新初始化图表，更新主题
				this.initChart()
				// 更新图表的显示
				this.screenAdapter()
				// 完成屏幕适配
				this.updataChart()

			}
		},
		created() {
			// 在组件创建完成之后，进行回调函数的注册
			this.$socket.registerCallBack('trendData', this.getData)
		},
		mounted() {
			console.log(this.theme),
			this.initChart()
			// this.getData()
			// 发送数据给服务器，告诉服务器我现在需要数据
			this.$socket.send({
				action: 'getData',
				socketType: 'trendData',
				chartName: 'trend',
				value: '',
			})
			console.log(222)
			window.addEventListener('resize', this.screenAdapter)
			this.screenAdapter()
		},
		destroyed() {
			window.removeEventListener('resize', this.screenAdapter)
			// 在组件销毁的时候。进行回调函数的取消
			this.$socket.unRegisterCallBack('trendData')
		},
		methods: {
			initChart() {
				this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
				const initOption = {
					xAxis: {
						type: 'category',
						boundaryGap: false
					},
					yAxis: {
						type: 'value'
					},
					tooltip: {
						trigger: 'axis'
					},
					legend: {
						left: 20,
						top: '15%',
						icon: 'circle'
					},
					grid: {
						left: '3%',
						top: '35%',
						right: '4%',
						bottom: '1%',
						containLabel: true
					}
				}
				this.chartInstance.setOption(initOption)
			},
			// socket_service.js中调用的时候会传递一个参数过来
			async getData(res) {
				// const { data: res } = await this.$http.get('http://127.0.0.1:8888/api/trend')
				this.allData = res
				console.log('res: ', res)

				this.updataChart()
			},
			updataChart() {
				// 半透明的颜色值
				const colorArr1 = [
					'rgba(11, 168, 44, 0.5)',
					'rgba(44, 110, 255, 0.5)',
					'rgba(22, 242, 217, 0.5)',
					'rgba(254, 33, 30, 0.5)',
					'rgba(250, 105, 0, 0.5)'
				]
				// 全透明的颜色值
				const colorArr2 = [
					'rgba(11, 168, 44, 0)',
					'rgba(44, 110, 255, 0)',
					'rgba(22, 242, 217, 0)',
					'rgba(254, 33, 30, 0)',
					'rgba(250, 105, 0, 0)'
				]

				const timeArr = this.allData.common.month
				const valueArr = this.allData. [this.choiceType].data
				const seriesArr = valueArr.map((item, index) => {
					return {
						name: item.name,
						type: 'line',
						data: item.data,
						stack: this.choiceType,
						areaStyle: {
							color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
									offset: 0,
									color: colorArr1[index]
								},
								{
									offset: 1,
									color: colorArr2[index]
								}
							])
						}
					}
				})
				const legendArr = valueArr.map(item => {
					return item.name
				})
				const dataOption = {
					xAxis: {
						data: timeArr
					},
					legend: {
						data: legendArr
					},
					series: seriesArr
				}
				this.chartInstance.setOption(dataOption)
			},
			screenAdapter() {
				this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
				const adapterOption = {
					legend: {
						itemWidth: this.titleFontSize,
						itemHeight: this.titleFontSize,
						itemGap: this.titleFontSize,
						textStyle: {
							fontSize: this.titleFontSize / 2
						}
					}
				}
				this.chartInstance.setOption(adapterOption)
				this.chartInstance.resize()
			},
			handleSelect(currentType) {
				this.choiceType = currentType
				this.updataChart()
				this.showChoice = false
			}
		}
	}
</script>

<style scoped>
	.title {
		position: absolute;
		z-index: 10;
		top: 20px;
		left: 20px;
		color: white;
	}

	.title-icon {
		margin-left: 10px;
		cursor: pointer;
	}

	.select-con {
		background-color: '#222733';
	}
</style>
