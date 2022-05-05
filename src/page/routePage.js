import { Route, Link } from '../../lzy-React-dev/js/myRouter/index'
import RekvTest from './RekvTest'
import Demo from './Demo'

function RoutePage() {

    return {
        components: { Link, Route },
        data: { RekvTest, Demo },
        template: `
            <div>

                <Route>
                    <Link to="/" component={RekvTest} title='跳转Rekv(重定向)'></Link>
                    <br></br>
                    <Link to="#rekvTest" component={RekvTest} title='跳转Rekv页面'></Link>
                    <br></br>
                    <Link to="#demo" component={Demo} title='跳转Demo页面'></Link>
                </Route>
                
                                
            </div>
        `
    }
}


export default RoutePage