<?php

namespace Drupal\gatsby_webform\Plugin\jsonapi\FieldEnhancer;

use Drupal\Component\Serialization\Yaml;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\jsonapi_extras\Plugin\ResourceFieldEnhancerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Shaper\Util\Context;

/**
 * Perform additional manipulations to Webform elements.
 *
 * @ResourceFieldEnhancer(
 *   id = "webform_elements",
 *   label = @Translation("Webform elements"),
 *   description = @Translation("Transform Webform elements field to usable format")
 * )
 */
class WebformElementsEnhancer extends ResourceFieldEnhancerBase implements ContainerFactoryPluginInterface {

  /**
   * @var Drupal\Component\serialization\Yaml
   */
  protected $encoder;

  /**
   *
   * @param array $configuration
   * @param string $plugin_id
   * @param $plugin_definition
   * @param \Drupal\Component\Serialization\Yaml $encoder
   */
  public function __construct(array $configuration, string $plugin_id, $plugin_definition, Yaml $encoder) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->encoder = $encoder;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('serialization.yaml')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [];
  }

  /**
   * {@inheritdoc}
   *
   * Transforms webform build source to data structure that is easier to process in jsonapi consumers.
   *
   * @param string $data Webform build source YAML string
   */
  public function doUndoTransform($data, Context $context) {
    $elements = $this->encoder->decode($data);
    $data = [];

    // Webform source format in json is { "field_name1": { "type": "textfield" }, "field_name2": ... }.
    //
    // That is incompatible with GraphQL because it transforms each unique
    // input field to separate data structure. We would have to query
    // each field like so:
    //
    // fragment {
    //   field_name1 {
    //     _type
    //     ...
    //   }
    //   field_name2 {
    //     _type
    //   }
    // }.
    //
    // This requires us to know input field names before the query.
    //
    // Better format would be to flatten data structure to array and have
    // common field contain the varying data:
    //
    // [{ "name": "field_name1", "#type": "textfield" }, { "name": "field_name2", ... }]
    //
    // Then query could be simplified to:
    //
    // fragment {
    //   name
    //   _type
    // }
    //
    // This loop does the beforementioned transformation:
    foreach ($elements as $name => $attributes) {
      $data[] = [
        'name' => $name
      ] + self::normalizeAttributes($attributes);
    }

    return $data;
  }

  /**
   * {@inheritdoc}
   */
  protected function doTransform($data, Context $context) {
    return $data;
  }

  /**
   * {@inheritdoc}
   */
  public function getOutputJsonSchema() {
    return [
      'type' => 'array',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getSettingsForm(array $resource_field_info) {
    return [];
  }

  /**
   * Normalize attributes.
   *
   * @param array $attributes
   * @return void
   */
  private static function normalizeAttributes(array $attributes) {
    // Default values to make it easier for GraphQL to infer types if some keys are missing.
    $normalizedAttributes = [
      'type' => null,
      'states' => null,
      'options' => null,
      'attributes' => []
    ];

    foreach ($attributes as $name => $content) {
      switch ($name) {
        // Form element type (e.g. textfield or email). Should be present on every element.
        case '#type':

          $normalizedAttributes['type'] = $content;
          break;

        // Drupal form api states.
        case '#states':
          $states = [];

          foreach ($content as $key => $value) {
            $selector = array_keys($value)[0];
            $states[] = [
              'state' => $key,
              'selector' => $selector,
              'condition' => $value[$selector]
            ];
          }

          $normalizedAttributes['states'] = $states;
          break;

        // Checkbox or select element options.
        case '#options':
          $options = [];

          foreach ($content as $value => $label) {
            $options[] = [
              'value' => strval($value),
              'label' => $label
            ];
          }

          $normalizedAttributes['options'] = $options;
          break;

        // Other attributes that can be represented as key => string.
        default:
          $normalizedAttributes['attributes'][] = [
            'name' => $name,
            'value' => strval($content)
          ];
          break;
      }
    }

    return $normalizedAttributes;
  }

}
