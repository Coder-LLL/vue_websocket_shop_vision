<template>
	<div class="com-container">
		<div class="com-chart" ref="rank_ref"></div>
	</div>
</template>

<script>
	import {mapState} from 'vuex'
	export default {
		data() {
			return {
				chartInstance: null,
				allData: null,
				startValue: 0,
				endValue: 9,
				timer: null
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
			clearInterval(this.timer)
			window.removeEventListener('resize', this.screenAdapter)
		},
		methods: {
			initChart() {
				this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
				// 对图表进行鼠标事件的监听
				const initOption = {
					xAxis: {
						type: 'category'
					},
					yAxis: {
						type: 'value'
					},
					title:{
						text: '▎地区销售排行',
						left:20,
						top:20
					},
					grid:{
						top: '40%',
						left: '5%',
						right: '5%',
						bottom: '5%',
						containLabel:true
					},
					tooltip:{
						show: true
					},
					series: [
						{
							type: 'bar'
						}
					]
				}
				this.chartInstance.setOption(initOption)
				// 当鼠标移动到图表上的时候，停止自动滚动
				this.chartInstance.on('mouseover',() => {
					clearInterval(this.timer)
				})
				// 当鼠标移动出图表的时候，开始自动滚动
				this.chartInstance.on('mouseout',() => {
					this.startInterval()
				})
			},
			
			async getData() {
				// 数据获取
				const {data: ret} = await this.$http.get('rank')
				this.allData = ret
				this.allData.sort((a,b) => {
					return b.value - a.value
				})
				// console.log(this.allData)
				// 数据获取完之后更新图表
				this.updataChart()
				// 在获取数据之后。加载完图表，就可以启动自动滚动的动画了
				this.startInterval()
			},
			updataChart() {
				// 颜色数组
				const colorArr = [
				  ['#0BA82C', '#4FF778'],
				  ['#2E72BF', '#23E5E5'],
				  ['#5052EE', '#AB6EE5'],
				]
				// 所有省份形成的数组
				const provinceArr = this.allData.map(item => {
					return item.name
				})
				// 所有省份对应的金额
				const valueArr = this.allData.map(item => {
					return item.value
				})
				// console.log(valueArr)
				// console.log(provinceArr)
				const dataOption = {
					xAxis: {
						data: provinceArr
					},
					dataZoom: {
						show: false,
						startValue: this.startValue,
						endValue: this.endValue
					},
					series: [
						{
							data: valueArr,
							itemStyle:{
								color: (arg) => {
									let targetColorArr = null 
									if( arg.value > 300 ){
										targetColorArr = colorArr[0]
									}else if(arg.value > 200){
										targetColorArr = colorArr[1]
									}else{
										targetColorArr = colorArr[2]
									}
									
									return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1,[
										{
											offset: 0,
											color: targetColorArr[0]
										},
										{
											offset: 1,
											color: targetColorArr[1]
										}
									])
								}
							},
							
						}
					]
					
				}
				this.chartInstance.setOption(dataOption)
			},

			// 当浏览器的大小发生变化的时候，会调用的方法，来完成屏幕的适配
			screenAdapter() {
				const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6
				// 浏览器分辨率大小相关的配置项
				const adapterOption = {
					title: {
						textStyle: {
							fontSize: titleFontSize,
						},
					},
					tooltip: {
						axisPointer: {
							lineStyle: {
								width: titleFontSize,
							},
						},
					},
					series: [{
						barWidth: titleFontSize,
						itemStyle: {
							barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0],
						},
					}, ],
				}
				this.chartInstance.setOption(adapterOption)
				// 手动调用图表的 resize 才能产生效果
				this.chartInstance.resize()
			},
			startInterval(){
				if(this.timer){
					clearInterval(this.timer)
				}
				this.timer = setInterval(() => {
					this.startValue++
					this.endValue++
					if( this.endValue > this.allData.length-1){
						this.endValue=9
						this.startValue=0
					}
					this.updataChart()
				},2000)
			}
		}
	}
</script>

<style scoped>
</style>

