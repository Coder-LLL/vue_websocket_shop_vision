<template>
	<div class="com-container">
		<div class="com-chart" ref="hot_ref"></div>
		<span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
		<span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
		<span class="cat-name" :style="comStyle">{{catName}}</span>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import { getThemeValue } from '../utils/theme_utils.js'
	export default {
		name: 'Hot',
		data() {
			return {
				chartInstance: null,
				allData: null,
				currentIndex: 0,
				titleFontSize: 0
			}
		},
		watch:{
			theme(){
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
		computed:{
			...mapState(['theme']),
			catName(){
				if(!this.allData){
					return ''
				}else{
					return this.allData[this.currentIndex].name
				}
			},
			comStyle(){
				return {
					fontSize: this.titleFontSize + "px",
					color: getThemeValue(this.theme).titleColor
					
				}
			}
		},
		mounted() {
			this.initChart()
			this.getData()
			window.addEventListener('resize', this.screenAdapter)
			this.screenAdapter()
		},
		destroyed() {
			window.removeEventListener('resize', this.screenAdapter)
		},
		methods: {
			initChart() {
				this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
				// 对图表进行鼠标事件的监听


				const initOption = {
					title:{
						text: '▎热销商品的占比',
						left: 20,
						top: 20
					},
					series: [{
						type: 'pie',
						label: {
							show: false
						},
						emphasis: {
							label: {
								show:true
							},
							labelLine:{
								show: true
							}
						},
					}],
					legend:{
						top: '15%',
						icon: 'circle'
					},
					tooltip: {
						show: true,
						formatter: (arg) => {
							const thirdCategory = arg.data.children
							let total = 0;
							thirdCategory.forEach(item => {
								total += item.value
							})
							let retStr = ''
							thirdCategory.forEach(item => {
								retStr += `
								${item.name} : ${parseInt(item.value / total * 100) + "%"}
								`
							})
							return retStr
						}
					}
				}
				this.chartInstance.setOption(initOption)
			},

			async getData() {
				const {
					data: ret
				} = await this.$http.get('hotproduct')
				this.allData = ret
				console.log(ret)
				// 数据获取完之后更新图表
				this.updataChart()
			},
			updataChart() {
				const legendData = this.allData[this.currentIndex].children.map((item) => {
					return item.name
				})
				const seriesData = this.allData[this.currentIndex].children.map((item) => {
					return {
						name: item.name,
						value: item.value,
						children: item.children
					}
				})
				const dataOption = {
					legend: {
						data: legendData
					},
					series: [{
						data: seriesData
					}]
				}
				this.chartInstance.setOption(dataOption)
			},
			// 当浏览器的大小发生变化的时候，会调用的方法，来完成屏幕的适配
			screenAdapter() {
					this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6
					// 浏览器分辨率大小相关的配置项
					const adapterOption = {
						title: {
							textStyle: {
								fontSize: this.titleFontSize,
							},
						},
						tooltip: {
							axisPointer: {
								lineStyle: {
									width: this.titleFontSize,
								},
							},
						},
						series: [{
							radius: this.titleFontSize * 4.5,
							center: ['50%','60%'],
						}],
						legend: {
							itemWidth: this.titleFontSize,
							itemHeight: this.titleFontSize,
							itemGap: this.titleFontSize / 2,
							textStyle: {
								fontSize: this.titleFontSize / 2
							}
						}
					}
					this.chartInstance.setOption(adapterOption)
					// 手动调用图表的 resize 才能产生效果
					this.chartInstance.resize()
			},
			toLeft(){
				this.currentIndex--
				if(this.currentIndex < 0){
					this.currentIndex = this.allData.length - 1
				}
				this.updataChart()
			},
			toRight(){
				this.currentIndex++
				if(this.currentIndex > this.allData.length - 1){
					this.currentIndex = 0
				}
				this.updataChart()
			}
		}
	}
</script>

<style scoped>
	.arr-left {
		position: absolute;
		left: 10%;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		color: white;
	}

	.arr-right {
		position: absolute;
		right: 10%;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		color: white;
	}
	.cat-name{
		position: absolute;
		left: 80%;
		bottom: 20px;
		color: white;
	}
</style>
