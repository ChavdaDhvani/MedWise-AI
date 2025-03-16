import csv

def calculate_apriori_confidence(X, Y, buckets):
    occr_X, occr_Y = 0, 0
    for bucket in buckets:
        if isinstance(X, list) and all(val in bucket for val in X):
            occr_X += 1
        elif X in bucket:
            occr_X += 1

        if isinstance(Y, list) and all(val in bucket for val in Y):
            occr_Y += 1
        elif Y in bucket:
            occr_Y += 1

    return (float(occr_Y) / float(occr_X) * 100) if occr_X else 0

def pred_dis(symptomlist, buckets):
    disease_score = {}
    disease_bucket = {}
    sure = False

    for bucket in buckets:
        bucket_len = float(len(bucket))
        score = set(symptomlist) & set(bucket)
        interection_len = float(len(score))

        score_1 = interection_len / bucket_len * 100
        score = float(len(score)) / float(len(symptomlist)) * 100

        if score == 100 and score_1 == 100:
            sure = True
            print(f"It is most likely {get_disease_given_bucket(bucket)}")
            return [], [], [], {}

        if score > 0:
            disease = get_disease_given_bucket(bucket)
            disease_score[disease] = score
            disease_bucket[disease] = bucket

    top_3 = sorted(disease_score.items(), reverse=True, key=lambda x: x[1])[:3]
    
    symptom_new = []
    for illness in top_3:
        dif = set(disease_bucket[illness[0]]).difference(set(symptomlist))
        symptom = "fever"
        prev_confidence = 0

        for symp in dif:
            if symp and calculate_apriori_confidence(disease_bucket[illness[0]], symp, buckets) > prev_confidence:
                symptom = symp

        symptom_new.append(symptom)

    return symptom_new, top_3, symptomlist, disease_bucket

def react_out(out, top_3, symptomlist, disease_bucket):
    score, score_1 = [], []

    for illness in top_3:
        symptomlist_new = symptomlist.copy()

        for response in out:
            if response == 'Y':
                symptomlist_new.append(symptomlist_new[-1])

        inters = set(symptomlist_new) & set(disease_bucket[illness[0]])
        score.append(len(inters) / len(symptomlist_new) * 100)
        score_1.append(len(inters) / len(disease_bucket[illness[0]]) * 100)

    ind = max(range(len(score)), key=lambda i: (score[i], score_1[i]))

    print(f"It is most probably {top_3[ind][0]}")
    return top_3[ind][0]

def get_disease_given_bucket(bucket):
    with open("bucketmap.csv", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            row_clean, bucket_clean = list(filter(None, row)), list(filter(None, bucket))
            if len(row_clean) == len(bucket_clean) + 1 and all(value in row_clean for value in bucket_clean):
                return row_clean[0]
    return ""

def solver(symptomlist):
    buckets = []
    with open("buckets.csv", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        buckets = list(reader)

    return pred_dis(symptomlist, buckets)
