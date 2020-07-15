import { AtNavBar } from 'taro-ui'
import Taro, {Component} from '@tarojs/taro'
import {View, WebView} from '@tarojs/components'
import './doubanWeb.scss'
import black from '../../../ss.png'

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      link:''
    }
  };

  // eslint-disable-next-line react/sort-comp
  config = {
    navigationBarTitleText: '西科影讯'
  };

  componentWillMount() {
    console.log(this.$router.params);
    const {link}=this.$router.params;
       this.setState({
         link
       })

  };

  render() {
    const {link}=this.state;
    console.log(link);
    return (
      <View className='index'>
        <WebView src={link} onMessage={this.handleMessage}/>
      </View>
    )
  }
}
