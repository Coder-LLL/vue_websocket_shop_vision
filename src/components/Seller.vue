<template>
	<div class="com-container">
		<div class="com-chart" ref="seller_ref"></div>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		name: 'Seller',
		data() {
			return {
				chartInstance: null,
				allData: null,
				currentPage: 1,
				totalPage: 0,
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
			clearInterval(this.timerId)
			window.removeEventListener('resize', this.screenAdapter)
		},
		methods: {
			initChart() {
				this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
				// 对图表进行鼠标事件的监听


				const initOption = {
					title: {
						text: '▎商家销售统计',
						left: 20,
						top: 20
					},
					grid: {
						top: '20%',
						left: '3%',
						right: '6%',
						bottom: '3%',
						containLabel: true
					},
					xAxis: {
						type: 'value'
					},
					yAxis: {
						type: 'category',
					},
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							type: 'line',
							z: 0,
							lineStyle: {
								color: '#2D3443'
							}
						}
					},
					series: {
						type: 'bar',
						barWidth: 66,
						label: {
							show: true,
							position: 'right',
							textStyle: {
								color: 'white'
							}
						},
						itemStyle: {
							// 指明颜色渐变方向
							// 指明不同百分比之下的颜色的值
							color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [{
									offset: 0,
									color: '#5052EE'
								},
								{
									offset: 1,
									color: '#AB6EE5'
								}
							])
						}
					},
				}
				this.chartInstance.setOption(initOption)
				// 对图表进行鼠标事件的监听
				this.chartInstance.on('mouseover', () => {
					this.timerId && clearInterval(this.timerId)
				})
				this.chartInstance.on('mouseout', () => {
					this.startInterval()
				})
			},
			
			async getData() {
				const {
					data: ret
				} = await this.$http.get('seller')
				// 将数据保存在data中
				this.allData = ret
				// 对数组进行排序
				this.allData.sort((a, b) => {
					return a.value - b.value
				})
				this.totalPage = this.allData.length % 5 == 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
				// console.log("总页数： " + this.totalPage)
				// 数据获取完之后更新图表
				this.updataChart()
				this.startInterval()
			},
			updataChart() {
				const start = (this.currentPage - 1) * 5
				const end = this.currentPage * 5
				const showData = this.allData.slice(start, end)
				const sellerNames = showData.map((item) => {
					return item.name
				})
				const sellerValue = showData.map((item) => {
					return item.value
				})
				const dataOption = {
					yAxis: {
						data: sellerNames
					},
					series: {
						data: sellerValue,
					},
				}
				this.chartInstance.setOption(dataOption)
			},
			startInterval() {
				//   // 一般使用定时器都有一个保险操作,先关闭再开启
				//   this.timerId && clearInterval(this.timerId)

				this.timerId = setInterval(() => {
					this.currentPage++
					// console.log(this.currentPage)
					if (this.currentPage >= this.totalPage) {
						this.currentPage = 1
					}
					this.updataChart()
				}, 3000)
			},
			// 当浏览器的大小发生变化的时候，会调用的方法，来完成屏幕的适配
			screenAdapter() {
				const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6
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
							barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
						},
					}, ],
				}
				this.chartInstance.setOption(adapterOption)
				// 手动调用图表的 resize 才能产生效果
				this.chartInstance.resize()
			},
		}
	}
</script>

<style scoped>
</style>
