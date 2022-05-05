import { listenLink, RouteContainer, RouteLink } from '../../lzy-React-dev/js/myRouter/index'


function RoutePage() {

    return {
        components: { RouteLink, RouteContainer },
        template: `
            <div>
                <RouteLink></RouteLink>
                <br></br>
                <RouteLink></RouteLink>
            </div>
        `
    }
}

export default RoutePage