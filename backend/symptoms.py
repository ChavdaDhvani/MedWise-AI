import csv
import itertools

def calculate_apriori_confidence(X, Y, buckets):
    """
    Calculate the Apriori confidence between X and Y.
    X and Y can be either single symptoms or lists of symptoms.
    """
    occr_X = 0
    occr_Y = 0
    for bucket in buckets:
        # Check if X occurs in the bucket
        if isinstance(X, list):
            if all(val in bucket for val in X):
                occr_X += 1
        else:
            if X in bucket:
                occr_X += 1

        # Check if Y occurs in the bucket
        if isinstance(Y, list):
            if all(val in bucket for val in Y):
                occr_Y += 1
        else:
            if Y in bucket:
                occr_Y += 1

    # Calculate the confidence
    if occr_X == 0:
        return 0  # Avoid division by zero
    conf = float(occr_Y) / float(occr_X) * 100
    return conf


def pred_dis(symptomlist, buckets):
    """
    Predict the disease based on the symptom list and the symptom-disease buckets.
    """
    disease_score = {}
    disease_bucket = {}
    sure = 0
    top_3 = []

    for bucket in buckets:
        bucket_len = float(len(bucket))
        score = set(symptomlist) & set(bucket)
        intersection_len = float(len(score))
        score = float(len(score)) / float(len(symptomlist)) * 100
        score_1 = intersection_len / bucket_len * 100

        if score == 100 and score_1 == 100:
            sure = 1
            disease = get_disease_given_bucket(bucket)
            print(f"It is most likely {disease}")
            return

        if score > 0:
            disease = get_disease_given_bucket(bucket)
            disease_score[disease] = score
            disease_bucket[disease] = bucket

    # Sort diseases by score and return top 3
    top_3 = sorted(disease_score.items(), reverse=True, key=lambda x: x[1])[:3]
    symptom_new = []

    # Suggest additional symptoms for the top 3 diseases
    for illness in top_3:
        symptomlist_new = symptomlist.copy()
        dif = set(disease_bucket[illness[0]]).difference(set(symptomlist))
        prev_confidence = 0
        while len(dif) > 0:
            symp = dif.pop()
            if symp == '':
                continue
            if calculate_apriori_confidence(disease_bucket[illness[0]], symp, buckets) > prev_confidence:
                symptom_new.append(symp)

    return symptom_new, top_3, symptomlist, disease_bucket


def react_out(out, top_3, symptomlist, disease_bucket):
    """
    React to the predicted disease and suggest additional symptoms based on user input.
    """
    score = []
    score_1 = []
    symptomlist_new = symptomlist.copy()

    for illness in top_3:
        for i in range(len(out)):
            x = out[i]
            if x == 'Y':
                symptomlist_new.append(symptomlist[i])

        # Calculate the intersection between the updated symptom list and the disease's symptoms
        inters = set(symptomlist_new) & set(disease_bucket[illness[0]])
        score.append(float(len(inters)) / float(len(symptomlist_new)) * 100)
        score_1.append(float(len(inters)) / float(len(disease_bucket[illness[0]])) * 100)

    # Determine the most probable disease based on the scores
    ind = 0
    if score[1] > score[0] or (score[1] == score[0] and score_1[1] > score_1[0]):
        ind = 1
    if score[2] > score[ind] or (score[2] == score[ind] and score_1[2] > score_1[ind]):
        ind = 2

    print(f"It is most probably {top_3[ind][0]}")
    return top_3[ind][0]


def get_disease_given_bucket(bucket):
    """
    Given a symptom bucket, find the corresponding disease.
    """
    disease = ""
    with open("bucketmap.csv") as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            row_clean = [i for i in row if i]
            bucket_clean = [i for i in bucket if i]
            if len(row_clean) == (len(bucket_clean) + 1):
                if all(values in row_clean for values in bucket_clean):
                    disease = row_clean[0]
                    break
    return disease


def solver(symptomlist):
    """
    Given a list of symptoms, solve and predict the disease.
    """
    buckets = []
    with open("buckets.csv") as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            buckets.append(row)

    return pred_dis(symptomlist, buckets)
