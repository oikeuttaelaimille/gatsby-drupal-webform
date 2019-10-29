<?php

namespace Drupal\gatsby_webform\Plugin\rest\resource;

use Drupal\webform\Entity\Webform;
use Drupal\webform\WebformInterface;
use Drupal\webform\WebformSubmissionForm;
use Drupal\webform\WebformSubmissionInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ModifiedResourceResponse;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Creates a resource for submitting webforms.
 *
 * @RestResource(
 *   id = "gatsby_webform_submit",
 *   label = @Translation("Webform Submit"),
 *   uri_paths = {
 *     "canonical" = "/gatsby_webform/submit",
 *     "https://www.drupal.org/link-relations/create" = "/gatsby_webform/submit"
 *   }
 * )
 */
class WebformSubmitResource extends ResourceBase {

  /**
   * Responds to entity POST requests and saves the new entity.
   *
   * @param array $webform_data
   *   Webform field data and webform ID.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws HttpException in case of error.
   */
  public function post(array $webform_data) {
    // Basic check for webform ID.
    if (empty($webform_data['webform_id'])) {
      return new JsonResponse([
        'error' => [
          'code' => '400',
          'message' => 'Missing webform id',
        ],
      ], 400);
    }

    // Check for a valid webform.
    $webform = Webform::load($webform_data['webform_id']);
    if (!$webform) {
      return new ModifiedResourceResponse([
        'error' => [
          'message' => 'Invalid webform_id value.',
        ],
      ], 400);
    }

    // Convert to webform values format.
    $current_request = \Drupal::requestStack()->getCurrentRequest();
    $values = [
      'in_draft' => FALSE,
      'uid' => \Drupal::currentUser()->id(),
      'uri' => '/gatsby_webform/submit' . $webform_data['webform_id'],
      // Check if remote IP address should be stored.
      'remote_addr' => $webform->hasRemoteAddr() ? $current_request->getClientIp() : '',
      'webform_id' => $webform_data['webform_id'],
    ];

    $values['data'] = $webform_data;

    // Don't submit webform ID.
    unset($values['data']['webform_id']);

    // Check if webform is open.
    $is_open = WebformSubmissionForm::isOpen($webform);

    if ($is_open === TRUE) {
      $webform_submission = WebformSubmissionForm::submitFormValues($values);

      // Check if submit was successful.
      if ($webform_submission instanceof WebformSubmissionInterface) {
        return new ModifiedResourceResponse([
          'sid' => $webform_submission->id(),
          'settings' => self::getWhitelistedSettings($webform),
        ]);
      }
      else {
        // Return validation errors.
        return new ModifiedResourceResponse([
          'error' => $webform_submission,
        ], 400);
      }
    }
    else {
      return new ModifiedResourceResponse([
        'error' => [
          'message' => 'This webform is closed, or too many submissions have been made.',
        ],
      ], 400);
    }
  }

  static private function getWhitelistedSettings(WebformInterface $webform) {
    $whitelist = [
      'confirmation_url',
      'confirmation_type',
      'confirmation_message',
      'confirmation_title',
    ];

    return array_intersect_key(
      $webform->getSettings(),
      array_flip($whitelist)
    );
  }

}
