/*******************************************************************************
 * Copyright © 2017-2018 Mikhail Perelygin <zmey3301@gmail.com>. All rights reserved.
 * Huge thanks to Koshevarov Sergey <gondragos@gmail.com> for plugin idea.
 * Program is distributed under the terms of the GNU Affero General Public License.
 *
 * @date         24.3.2018
 * @license     AGPL-3.0-or-later
 ******************************************************************************/

import Adaptive from './adaptive'
export default {
	/**
	 * Vue plugin install function
	 * @param Vue
	 * @param config
	 */
	install (Vue, config) {
		let adaptive = new Adaptive(Vue, config)
		Vue.mixin({
			beforeCreate () {
				this.$adaptive = adaptive
			}
		})
	}
}

