import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  DYNAMIC_FORM_CONTROL_MAP_FN,
  DynamicCheckboxModel,
  DynamicDatePickerModel,
  DynamicFormArrayModel,
  DynamicSelectModel,
} from '@ng-dynamic-forms/core';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LiveRegionService } from 'src/app/shared/live-region/live-region.service';
import {
  APP_CONFIG,
  APP_DATA_SERVICES_MAP,
} from 'src/config/app-config.interface';
import { environment } from 'src/environments/environment.test';

import { SubmissionAccessesConfigDataService } from '../../../core/config/submission-accesses-config-data.service';
import { JsonPatchOperationsBuilder } from '../../../core/json-patch/builder/json-patch-operations-builder';
import { SubmissionJsonPatchOperationsService } from '../../../core/submission/submission-json-patch-operations.service';
import { SubmissionObjectDataService } from '../../../core/submission/submission-object-data.service';
import { XSRFService } from '../../../core/xsrf/xsrf.service';
import { dsDynamicFormControlMapFn } from '../../../shared/form/builder/ds-dynamic-form-ui/ds-dynamic-form-control-map-fn';
import { DsDynamicTypeBindRelationService } from '../../../shared/form/builder/ds-dynamic-form-ui/ds-dynamic-type-bind-relation.service';
import { FormBuilderService } from '../../../shared/form/builder/form-builder.service';
import { FormComponent } from '../../../shared/form/form.component';
import { FormService } from '../../../shared/form/form.service';
import { getLiveRegionServiceStub } from '../../../shared/live-region/live-region.service.stub';
import { getMockFormBuilderService } from '../../../shared/mocks/form-builder-service.mock';
import { getMockFormOperationsService } from '../../../shared/mocks/form-operations-service.mock';
import { getMockFormService } from '../../../shared/mocks/form-service.mock';
import { getSectionAccessesService } from '../../../shared/mocks/section-accesses.service.mock';
import {
  getSubmissionAccessesConfigNotChangeDiscoverableService,
  getSubmissionAccessesConfigService,
} from '../../../shared/mocks/section-accesses-config.service.mock';
import { mockAccessesFormData } from '../../../shared/mocks/submission.mock';
import {
  accessConditionChangeEvent,
  checkboxChangeEvent,
} from '../../../shared/testing/form-event.stub';
import { SectionsServiceStub } from '../../../shared/testing/sections-service.stub';
import { SubmissionJsonPatchOperationsServiceStub } from '../../../shared/testing/submission-json-patch-operations-service.stub';
import { SubmissionService } from '../../submission.service';
import { SectionFormOperationsService } from '../form/section-form-operations.service';
import { SectionsService } from '../sections.service';
import { SubmissionSectionAccessesComponent } from './section-accesses.component';
import { SectionAccessesService } from './section-accesses.service';


function getMockDsDynamicTypeBindRelationService(): DsDynamicTypeBindRelationService {
  return jasmine.createSpyObj('DsDynamicTypeBindRelationService', {
    getRelatedFormModel: jasmine.createSpy('getRelatedFormModel'),
    matchesCondition: jasmine.createSpy('matchesCondition'),
    subscribeRelations: jasmine.createSpy('subscribeRelations'),
  });
}

describe('SubmissionSectionAccessesComponent', () => {
  let component: SubmissionSectionAccessesComponent;
  let fixture: ComponentFixture<SubmissionSectionAccessesComponent>;

  const sectionsServiceStub = new SectionsServiceStub();
  const builderService: FormBuilderService = getMockFormBuilderService();
  const submissionAccessesConfigService = getSubmissionAccessesConfigService();
  const sectionAccessesService = getSectionAccessesService();
  const sectionFormOperationsService = getMockFormOperationsService();
  const operationsBuilder = jasmine.createSpyObj('operationsBuilder', {
    add: undefined,
    remove: undefined,
    replace: undefined,
  });

  let formService: any;
  let formbuilderService: any;

  const storeStub = jasmine.createSpyObj('store', ['dispatch']);

  const sectionData = {
    header: 'submit.progressbar.accessCondition',
    config: 'http://localhost:8080/server/api/config/submissionaccessoptions/AccessConditionDefaultConfiguration',
    mandatory: true,
    sectionType: 'accessCondition',
    collapsed: false,
    enabled: true,
    data: {
      discoverable: true,
      accessConditions: [],
    },
    errorsToShow: [],
    serverValidationErrors: [],
    isLoading: false,
    isValid: true,
  };

  describe('First with canChangeDiscoverable true', () => {

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          CommonModule,
          TranslateModule.forRoot(),
          SubmissionSectionAccessesComponent,
          FormComponent,
        ],
        providers: [
          { provide: SectionsService, useValue: sectionsServiceStub },
          { provide: SubmissionAccessesConfigDataService, useValue: submissionAccessesConfigService },
          { provide: SectionAccessesService, useValue: sectionAccessesService },
          { provide: SectionFormOperationsService, useValue: sectionFormOperationsService },
          { provide: JsonPatchOperationsBuilder, useValue: operationsBuilder },
          { provide: FormService, useValue: getMockFormService() },
          { provide: Store, useValue: storeStub },
          { provide: SubmissionJsonPatchOperationsService, useValue: SubmissionJsonPatchOperationsServiceStub },
          { provide: 'sectionDataProvider', useValue: sectionData },
          { provide: 'submissionIdProvider', useValue: '1508' },
          { provide: DsDynamicTypeBindRelationService, useValue: getMockDsDynamicTypeBindRelationService() },
          { provide: SubmissionObjectDataService, useValue: {} },
          { provide: SubmissionService, useValue: {} },
          { provide: XSRFService, useValue: {} },
          { provide: APP_CONFIG, useValue: environment },
          { provide: APP_DATA_SERVICES_MAP, useValue: {} },
          { provide: DYNAMIC_FORM_CONTROL_MAP_FN, useValue: dsDynamicFormControlMapFn },
          { provide: LiveRegionService, useValue: getLiveRegionServiceStub() },
          FormBuilderService,
          provideMockStore({}),
        ],
      })
        .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(SubmissionSectionAccessesComponent);
      component = fixture.componentInstance;
      formService = TestBed.inject(FormService);
      formbuilderService = TestBed.inject(FormBuilderService);
      formService.validateAllFormFields.and.callFake(() => null);
      formService.isValid.and.returnValue(of(true));
      formService.getFormData.and.returnValue(of(mockAccessesFormData));
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have created formModel', () => {
      expect(component.formModel).toBeTruthy();
    });

    it('should have formModel length should be 2', () => {
      expect(component.formModel.length).toEqual(2);
    });

    it('formModel should have 1 model type checkbox and 1 model type array', () => {
      expect(component.formModel[0] instanceof DynamicCheckboxModel).toBeTrue();
      expect(component.formModel[1] instanceof DynamicFormArrayModel).toBeTrue();
    });

    it('formModel type array should have formgroup with 1 input and 2 datepickers', () => {
      const formModel: any = component.formModel[1];
      const formGroup = formModel.groupFactory()[0].group;

      expect(formGroup[0] instanceof DynamicSelectModel).toBeTrue();
      expect(formGroup[1] instanceof DynamicDatePickerModel).toBeTrue();
      expect(formGroup[2] instanceof DynamicDatePickerModel).toBeTrue();
    });

    it('should have set maxStartDate and maxEndDate properly', () => {
      const maxStartDate = { year: 2024, month: 12, day: 20 };
      const maxEndDate = { year: 2022, month: 6, day: 20 };

      const startDateModel = formbuilderService.findById('startDate', component.formModel);
      expect(startDateModel.max).toEqual(maxStartDate);
      const endDateModel = formbuilderService.findById('endDate', component.formModel);
      expect(endDateModel.max).toEqual(maxEndDate);
    });

    it('when checkbox changed it should call operationsBuilder replace function', () => {
      component.onChange(checkboxChangeEvent);
      fixture.detectChanges();

      expect(operationsBuilder.replace).toHaveBeenCalled();
    });

    it('when dropdown select changed it should call operationsBuilder add function', () => {
      component.onChange(accessConditionChangeEvent);
      fixture.detectChanges();
      expect(operationsBuilder.add).toHaveBeenCalled();
    });
  });

  describe('when canDescoverable is false', () => {

    beforeEach(async () => {
      formService = getMockFormService();
      await TestBed.configureTestingModule({
        imports: [
          CommonModule,
          TranslateModule.forRoot(),
          SubmissionSectionAccessesComponent,
          FormComponent,
        ],
        providers: [
          { provide: SectionsService, useValue: sectionsServiceStub },
          { provide: SubmissionAccessesConfigDataService, useValue: getSubmissionAccessesConfigNotChangeDiscoverableService() },
          { provide: SectionAccessesService, useValue: sectionAccessesService },
          { provide: SectionFormOperationsService, useValue: sectionFormOperationsService },
          { provide: JsonPatchOperationsBuilder, useValue: operationsBuilder },
          { provide: FormService, useValue: formService },
          { provide: Store, useValue: storeStub },
          { provide: SubmissionJsonPatchOperationsService, useValue: SubmissionJsonPatchOperationsServiceStub },
          { provide: 'sectionDataProvider', useValue: sectionData },
          { provide: 'submissionIdProvider', useValue: '1508' },
          { provide: DsDynamicTypeBindRelationService, useValue: getMockDsDynamicTypeBindRelationService() },
          { provide: SubmissionObjectDataService, useValue: {} },
          { provide: SubmissionService, useValue: {} },
          { provide: XSRFService, useValue: {} },
          { provide: APP_CONFIG, useValue: environment },
          { provide: APP_DATA_SERVICES_MAP, useValue: {} },
          { provide: DYNAMIC_FORM_CONTROL_MAP_FN, useValue: dsDynamicFormControlMapFn },
          { provide: LiveRegionService, useValue: getLiveRegionServiceStub() },
          FormBuilderService,
          provideMockStore({}),

        ],
      })
        .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(SubmissionSectionAccessesComponent);
      component = fixture.componentInstance;
      formService.validateAllFormFields.and.callFake(() => null);
      formService.isValid.and.returnValue(of(true));
      formService.getFormData.and.returnValue(of(mockAccessesFormData));
      fixture.detectChanges();
    });


    it('should have formModel length should be 1', () => {
      expect(component.formModel.length).toEqual(1);
    });

    it('formModel should have only 1 model type array', () => {
      expect(component.formModel[0] instanceof DynamicFormArrayModel).toBeTrue();
    });

  });
});
