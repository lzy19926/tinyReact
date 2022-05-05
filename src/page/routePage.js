import { Route, Link } from '../../lzy-React-dev/js/myRouter/index'
import RekvTest from './RekvTest'
import Demo from './Demo'
import Test from '../components/Test'

function RoutePage() {

    return {
        components: { Link, Route },
        data: { RekvTest, Demo, Test },
        template: `
            <div>

                    <Route></Route>
                 
                    <Link to="/" component={RekvTest} title='跳转Rekv(重定向)'></Link>
                    <br></br>
                    <Link to="/#Test" component={Test} title='跳转Test'></Link>
                    <br></br>
                    <Link to="/#demo" component={Demo} title='跳转Demo页面'></Link>
                                                
            </div>
        `
    }
}


export default RoutePage