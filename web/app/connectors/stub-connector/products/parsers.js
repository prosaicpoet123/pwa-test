import {getTextFrom, parseTextLink} from '../../../utils/parser-utils'
import {extractMagentoJson} from '../../../connectors/_merlins-connector/utils'


const parseCarouselItems = (magentoObject) => {
    const carouselSetup = magentoObject
          .getIn(['[data-gallery-role=gallery-placeholder]', 'mage/gallery/gallery', 'data'])
          .sortBy((item) => item.get('position'))
    return carouselSetup.toJS()
}

const carouselItemsToImages = (carouselItems) => {
    return carouselItems.map(({img, isMain, full, thumb, caption}) => ({
        alt: '',
        src: img,
        isMain,
        zoomSrc: full,
        thumbnailSrc: thumb,
        caption,
    }))
}

const getAvailabilityFrom = ($content) => {
    const availability = getTextFrom($content, '.product-info-stock-sku [title="Availability"]')
    return availability.toLowerCase() === 'in stock'
}

export const productDetailsParser = ($, $html) => {
    const $mainContent = $html.find('.page-main')
    const magentoObject = extractMagentoJson($html)
    const carouselItems = parseCarouselItems(magentoObject)
    const images = carouselItemsToImages(carouselItems)

    return {
        id: $mainContent.find('#product_addtocart_form input[name="product"]').val(),
        title: getTextFrom($mainContent, '.page-title-wrapper.product .page-title > span'),
        price: getTextFrom($mainContent, '.product-info-price .price-wrapper .price'),
        description: getTextFrom($mainContent, '.product.info.detailed .product.attibute.description p'),
        available: getAvailabilityFrom($mainContent),
        images,
        thumbnail: images[0]
    }
}

const parseBreadcrumbs = ($, $breadcrumbsLinks) => {
    return $breadcrumbsLinks.get()
        .map((breadcrumbLink) => parseTextLink($(breadcrumbLink)))
}

export const productDetailsUIParser = ($, $html) => {
    const $breadcrumbs = (
        $html
            .find('.breadcrumbs')
            .find('li')
            .not(':last-child')
            .find('a')
    )

    const $form = $html.find('.page-main #product_addtocart_form')

    return {
        breadcrumbs: parseBreadcrumbs($, $breadcrumbs),
        itemQuantity: parseInt($form.find('#qty').val())
    }
}
