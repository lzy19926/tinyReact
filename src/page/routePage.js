import { RouteContainer, Link } from '../../lzy-React/js/myRouter/index'
import RekvTest from './RekvTest'
import Demo from './Demo'
import Test from '../components/Test.lzy'


function RoutePage() {


    return {
        components: { Link, RouteContainer },
        data: { RekvTest, Demo, Test },
        template: `
                    <div>
                    <Link to="/#rekv" component={RekvTest} title='跳转Rekv(重定向)'></Link>
                    <br></br>
                    <Link to="/#test" component={Test} title='跳转Test'></Link>
                    <br></br>
                    <Link to="/#demo" component={Demo} title='跳转Demo页面'></Link>
                    <br></br>
                    <RouteContainer></RouteContainer>
                    </div>
        `
    }
}


export default RoutePage