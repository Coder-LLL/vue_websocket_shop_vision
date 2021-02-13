<template>
	<div class="com-container" @dblclick="revertMap">
		<div class="com-chart" ref="map_ref"></div>
	</div>
</template>

<script>
	import {mapState} from 'vuex'
	import {getProvinceMapInfo} from '../utils/map_utils.js'
	import axios from 'axios'
	export default {
		name: 'Map',
		data() {
			return {
				chartInstance: null,
				allData: null,
				mapData:{},
				
			}
		},
  mounted() {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    // 主动触发 响应式配置
    this.screenAdapter()
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
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 初始化图表的方法
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      // 获取中国地图的矢量数据： 可以通过发送网络请求获取,static/map/china.json 的数据
      // 由于配置了基础路径，所以不能直接 this.$http.get 来请求 static下的资源
			const ret = await axios.get('http://localhost:8999/static/map/china.json')
			
      // 注册地图数据
      this.$echarts.registerMap('china',ret.data)

      // 初始化配置项
      const initOption = {
        title: {
          text: '▎商家分布',
          left: 20,
          top: 20,
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          // //允许拖动及缩放
          // roam: true,
          // zoom: 1.1, //默认缩放比例
          itemStyle: {
            // 地图的填充色
            areaColor: '#2E72BF',
            // 省份的边框色
            borderColor: '#333',
          },

          // label: {
          //   show: true,
          //   color: 'white',
          //   formatter: `{a}`,
          // },
        },
				legend:{
					left: '5%',
					bottom: '5%',
					orient: 'vertical'
				},
      }
      this.chartInstance.setOption(initOption)
			// 对地图的点击事件进行监听
			this.chartInstance.on('click',async (arg) => {
				const provinceInfo =  getProvinceMapInfo(arg.name)
				// 在获取数据前，先判断当前点击的省份信息是否已经保存过，如果未保存则需要axios获取然后注册，如果已经保存过，则说明已经注册过了，直接使用就可以
				if(!this.mapData[provinceInfo.key]){
					const ret = await axios.get('http://localhost:8999/static' + provinceInfo.path)
					this.mapData[provinceInfo.key] = ret.data	
					this.$echarts.registerMap(provinceInfo.key,ret.data)
				}	
				console.log(this.mapData)
				const changeOption = {
					geo: {
						map: provinceInfo.key
					}
				}
				this.chartInstance.setOption(changeOption)
			})
    },
    // 发送请求，获取数据
    async getData(res) {
      // http://127.0.0.1:8888/api/map
      // const { data: res } = await this.$http.get('/map')
			const {data: ret} = await this.$http.get('map')			
			this.allData = ret
      this.updataChart()
    },
    // 更新图表配置项
    updataChart() {
			const legendArr = this.allData.map(item => {
				return item.name
			})
			const seriesArr = this.allData.map(item => {
				// return的这个对象就代表是一个类别下的所有散点数据
				// 如果想在地图中显示散点数据，我们需要给散点的图标增加一个配置
				return {
					type: 'effectScatter',
					name: item.name,
					data: item.children,
					coordinateSystem: 'geo',
					rippleEffect: {
						scale: 5,
						brushType: 'stroke'
					}
				}
			})
      // 数据配置项
      const dataOption = {
				series: seriesArr,
				legend: {
					data: legendArr
				}
      }
      this.chartInstance.setOption(dataOption)
    },
    // 不同分辨率的响应式
    screenAdapter() {
      // 当前比较合适的字体大小
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6

      // 响应式的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          // 图例宽度
          itemWidth: titleFontSize / 2,
          // 图例高度
          itemHeight: titleFontSize / 2,
          // 间隔
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      }

      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
		revertMap(){
			const revertOption = {
				geo: {
					map: 'china'
				}
			}
			this.chartInstance.setOption(revertOption)
		}
  },
	}
</script>

<style scoped>
</style>
