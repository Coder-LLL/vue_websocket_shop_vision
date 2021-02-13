<template>
	<div class="com-container">
		<div class="com-chart" ref="stock_ref"></div>
	</div>
</template>

<script>
	import {mapState} from 'vuex'
	export default {
		name: 'Stock',
		data() {
			return {
				chartInstance: null,
				allData: null,
				currentIndex: 0,
				timerId: null
			}
		},
		computed:{
			...mapState(['theme'])
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
		mounted() {
			this.initChart()
			this.getData()
			window.addEventListener('resize', this.screenAdapter)
			this.screenAdapter()
		},
		destroyed() {
			window.removeEventListener('resize', this.screenAdapter)
			clearInterval(this.timerId)
		},
		methods: {
			initChart() {
				this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
				// 对图表进行鼠标事件的监听


				const initOption = {
					title: {
						text: '▎库存和销量分析',
						left: 20,
						top: 20
					}
				}
				this.chartInstance.setOption(initOption)
				this.chartInstance.on('mouseover',() => {
					clearInterval(this.timerId)
				})
				this.chartInstance.on('mouseout',() => {
					this.startInterval()
				})
			},

			async getData() {
				const {
					data: ret
				} = await this.$http.get('stock')
				this.allData = ret
				// 数据获取完之后更新图表
				this.updataChart()
				this.startInterval()
			},
			updataChart() {
				const centerArr = [
					['18%', '40%'],
					['50%', '40%'],
					['82%', '40%'],
					['34%', '75%'],
					['66%', '75%'],
				]
				const colorArr = [
				  ['#4FF778', '#0BA82C'],
				  ['#E5DD45', '#E8B11C'],
				  ['#E8821C', '#E55445'],
				  ['#5052EE', '#AB6EE5'],
				  ['#23E5E5', '#2E72BF'],
				]
				const start = this.currentIndex * 5
				const end =( this.currentIndex * 5 + 1) * 5
				const showData = this.allData.slice(start, end)
				const seriesArr = showData.map((item,index) => {
					return {
						type: 'pie',
						center: centerArr[index],
						hoverAnimation: false,  // 关闭鼠标移入到饼图的动画效果
						labelLine:{      //指示线的去除
							show: false
						},
						label:{
							position: 'center',
							color: colorArr[index][0]
						},
						data:[
							{
								name: item.name + '\n' + item.sales,
								value: item.sales,
								itemStyle:{
									color: new this.$echarts.graphic.LinearGradient(0,1,0,0,[
										{
											offset: 0,
											color: colorArr[index][0]
										},
										{
											offset: 1,
											color: colorArr[index][1]
										}
									])
								}
							},
							{
								value: item.stock,
								itemStyle:{
									color: '#333843'
								}
							}
						]
					}
				})
				const dataOption = {
					series: seriesArr
				}
				this.chartInstance.setOption(dataOption)
			},
			// 当浏览器的大小发生变化的时候，会调用的方法，来完成屏幕的适配
			screenAdapter() {
				const titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6
				const innerRadius = titleFontSize * 2.8
				const outterRadius = innerRadius * 1.125
				// 浏览器分辨率大小相关的配置项
				const adapterOption = {
					title:{
						textStyle:{
							fontSize: titleFontSize 
						}
					},
					series: [
						{
							type: 'pie',
							radius: [outterRadius,innerRadius],
							label:{
								fontSize: titleFontSize / 2
							}
						},
						{
							type: 'pie',
							radius: [outterRadius,innerRadius],
							fontSize: titleFontSize / 2
						},
						{
							type: 'pie',
							radius: [outterRadius,innerRadius],
							fontSize: titleFontSize / 2
						},
						{
							type: 'pie',
							radius: [outterRadius,innerRadius],
							fontSize: titleFontSize / 2
						},
						{
							type: 'pie',
							radius: [outterRadius,innerRadius],
							fontSize: titleFontSize / 2
						}
					]
				}
				this.chartInstance.setOption(adapterOption)
				// 手动调用图表的 resize 才能产生效果
				this.chartInstance.resize()
			},
			startInterval(){
				if(this.timerId){
					clearInterval(this.timerId)
				}
				this.timerId = setInterval(() => {
					this.currentIndex++
					if(this.currentIndex >1){
						this.currentIndex=0
					}
					this.updataChart()
				},5000)
			}
		}
	}
</script>

<style scoped>

</style>
