import {AtNavBar, AtLoadMore} from 'taro-ui'
import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image, ScrollView} from '@tarojs/components'
import './index.scss'
import black from '../../../ss.png'

const {windowHeight} = Taro.getSystemInfoSync();
export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      film_list: [],
      pagination: {},
      page_no: 1,
      page_size: 5,
      status: 'loading'
    }
  };

  // eslint-disable-next-line react/sort-comp
  config = {
    navigationBarTitleText: '西科影讯'
  };

  componentWillMount() {
    this.listPage();
  }

  listPage = () => {
    const {page_no, page_size} = this.state;
    let baseUrl = window.location.href;
    let reg = /[\w]+[:]+\/\/+[\w.?:]+\//g;
    baseUrl = baseUrl.match(reg).toString();
    console.log(baseUrl);
    var that = this;
    Taro.request({
      // url:'https://app.iswust.cn/iswustserver/open/film/list',
      url: `${baseUrl}iswustserver/open/film/list`,
      data: {
        page_no, page_size
      },
      header: {
        'content-type': 'application/json'
      }
    }).then(res => {
      const {film_list, total_page, total_results} = res.data.data;
      film_list.forEach((item) => {
        console.log((item));
        item.release_date = that.regDateRelease(item.release_date);
        item.show_date = that.regDateShow(item.show_date);
        item.main_actor = item.main_actor.join('');
        let reg = /  /g;
        item.main_actor = item.main_actor.replace(reg, " , ");
        if (item.main_actor.length >= 42) {
          item.main_actor = `${item.main_actor.slice(0, 42)}...`
        }
      });
      this.setState({
        pagination: {
          total_page, total_results
        },
        film_list: film_list
      });
    })
  };

  regDateRelease = e => {
    let regDate = '';
    const reg = /\d{2}:\d{2}:\d{2}/g;
    regDate = e.replace(reg, "");
    return regDate;
  };

  regDateShow = e => {
    let regDate = '';
    let reg = /\d{2}:\d{2}:\d{2}/g;
    regDate = e.replace(reg, "");
    reg = /\d{4}-/g;
    regDate = regDate.replace(reg, "");
    reg = /[-]/g;
    regDate = regDate.replace(reg, "月");
    reg = / /g;
    regDate = regDate.replace(reg, "日");
    return regDate;
  };

  handleWebView = e => {
    Taro.navigateTo({
      url: `/pages/doubanWeb/doubanWeb?link=${e}`,
    })
  };

  onReachBottom = () => {
    const {page_no, page_size, pagination: {total_page}} = this.state;
    let baseUrl = window.location.href;
    let reg = /[\w]+[:]+\/\/+[\w.?:]+\//g;
    baseUrl = baseUrl.match(reg).toString();
    const that = this;
    if (page_no < total_page) {
      let page_now = page_no + 1;
      Taro.request({
        url: `${baseUrl}iswustserver/open/film/list`,
        data: {
          page_no: page_now, page_size
        },
        header: {
          'content-type': 'application/json'
        }
      }).then(res => {
        console.log(res.data.data);
        const {film_list} = res.data.data;
        film_list.forEach((item) => {
          console.log((item));
          item.release_date = that.regDateRelease(item.release_date);
          item.show_date = that.regDateShow(item.show_date);
          item.main_actor = item.main_actor.join('');
          let reg = /  /g;
          item.main_actor = item.main_actor.replace(reg, ", ");
          if (item.main_actor.length >= 42) {
            item.main_actor = `${item.main_actor.slice(0, 42)}...`
          }
        });
        setTimeout(() => {
          this.setState({
            status: 'loading'
          })
        }, 2000);
        this.setState({
          page_no: page_now,
          film_list: [...this.state.film_list, ...film_list],
        });
      });
      if (page_now === total_page) {
        setTimeout(() => {
          this.setState({
            status: 'noMore'
          })
        }, 2000)
      } else {
        setTimeout(() => {
          this.setState({
            status: 'loading'
          })
        }, 2000)
      }
    } else {
      setTimeout(() => {
        this.setState({
          status: 'noMore'
        })
      }, 2000)
    }
  }

  onScroll = (e) => {
    const {scrollTop, scrollHeight} = e.detail;
    if (scrollTop + windowHeight + 35 > scrollHeight) {
      this.onReachBottom()
    }
  };

  throttle = (fun, delay, time) => {
    var timeout,
      startTime = new Date();
    return function () {
      var context = this,
        args = arguments,
        curTime = new Date();
      clearTimeout(timeout);
      // 如果达到了规定的触发时间间隔，触发 handler
      if (curTime - startTime >= time) {
        fun.apply(context, args);
        startTime = curTime;
        // 没达到触发间隔，重新设定定时器
      } else {
        timeout = setTimeout(function () {
          fun.apply(context, args);
        }, delay);
      }
    };
  };

  render() {
    const scrollStyle = {
      height: windowHeight,
    };
    return (
      <View>
        <ScrollView
          className='list'
          scrollY
          style={scrollStyle}
          onScroll={this.throttle(this.onScroll, 500, 1000)}
        >
          {this.state.film_list.map((item, key) => <View className='card' key={key}>
            <View className='card-item' hover-class='card-item-hover'
                  onClick={this.handleWebView.bind(this, item.link)}
            >
              <View className='card-title'>
                <View className='avatar'>
                  <Image className='avatar' src={item.pic_url}/>
                </View>
                <View className='nickNameFlex'>
                  <View className='card-name'>
                    <Text className='card-title-txt'>{item.name}</Text>
                    <Image className='black' src={black}/>
                    <View className='black show'><Text>{item.show_date}</Text></View>
                  </View>
                  <View className='card-content'>
                    <View className='card-content-text'><Text>评分：{item.score}</Text></View>
                    <View className='card-content-text'><Text>导演：{item.director}</Text></View>
                    <View className='card-content-text'><Text>上映时间：{item.release_date}</Text></View>
                    <View className='card-content-text'>
                      主演：{item.main_actor}</View>
                  </View>
                </View>
              </View>
            </View>
          </View>)}
          <AtLoadMore
            // onClick={this.onReachBottom.bind(this)}
            status={this.state.status}
          />
        </ScrollView>
      </View>
    )
  }
}
